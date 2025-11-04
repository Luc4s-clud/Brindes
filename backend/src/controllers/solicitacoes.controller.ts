import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { StatusSolicitacao } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

// Gerar número único de solicitação
function gerarNumeroSolicitacao(): string {
  const ano = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `SOL-${ano}-${timestamp}`;
}

export const getAllSolicitacoes = async (req: AuthRequest, res: Response) => {
  try {
    const { status, centroCustoId, solicitanteId } = req.query;
    const userId = req.userId;
    const userPerfil = req.userPerfil;

    const where: any = {};

    // Se não for Marketing ou Diretor, só ver suas próprias solicitações
    if (userPerfil !== 'MARKETING' && userPerfil !== 'DIRETOR') {
      where.solicitanteId = userId;
    }

    if (status) {
      where.status = status as StatusSolicitacao;
    }

    if (centroCustoId) {
      where.centroCustoId = parseInt(centroCustoId as string);
    }

    if (solicitanteId && (userPerfil === 'MARKETING' || userPerfil === 'DIRETOR')) {
      where.solicitanteId = parseInt(solicitanteId as string);
    }

    const solicitacoes = await prisma.solicitacao.findMany({
      where,
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        centroCusto: true,
        itens: {
          include: {
            brinde: true,
          },
        },
        aprovacoes: {
          include: {
            aprovador: {
              select: {
                id: true,
                nome: true,
                perfil: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(solicitacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSolicitacaoById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userPerfil = req.userPerfil;

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        centroCusto: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        itens: {
          include: {
            brinde: true,
          },
        },
        aprovacoes: {
          include: {
            aprovador: {
              select: {
                id: true,
                nome: true,
                perfil: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar permissão
    if (userPerfil !== 'MARKETING' && userPerfil !== 'DIRETOR' && solicitacao.solicitanteId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(solicitacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { centroCustoId, justificativa, enderecoEntrega, prazoEntrega, finalidade, observacoes, itens } = req.body;

    if (!centroCustoId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Centro de custo e itens são obrigatórios' });
    }

    // Verificar centro de custo
    const centroCusto = await prisma.centroCusto.findUnique({
      where: { id: parseInt(centroCustoId) },
    });

    if (!centroCusto || !centroCusto.ativo) {
      return res.status(400).json({ error: 'Centro de custo inválido ou inativo' });
    }

    // Validar itens e calcular valor total
    let valorTotal = 0;
    const itensValidados = [];

    for (const item of itens) {
      const brinde = await prisma.brinde.findUnique({
        where: { id: item.brindeId },
      });

      if (!brinde || !brinde.ativo) {
        return res.status(400).json({ error: `Brinde ${item.brindeId} não encontrado ou inativo` });
      }

      if (brinde.quantidade < item.quantidade) {
        return res.status(400).json({ 
          error: `Estoque insuficiente para ${brinde.nome}. Disponível: ${brinde.quantidade}` 
        });
      }

      const valorItem = (brinde.valorUnitario || 0) * item.quantidade;
      valorTotal += valorItem;

      itensValidados.push({
        brindeId: item.brindeId,
        quantidade: item.quantidade,
        valorUnitario: brinde.valorUnitario,
        observacao: item.observacao,
      });
    }

    // Verificar limites de orçamento
    const orcamentoDisponivel = (centroCusto.orcamentoTotal || 0) - centroCusto.orcamentoUtilizado;
    
    if (centroCusto.orcamentoTotal && valorTotal > orcamentoDisponivel) {
      return res.status(400).json({ 
        error: 'Valor excede o orçamento disponível',
        orcamentoDisponivel,
        valorSolicitado: valorTotal,
      });
    }

    // Criar solicitação
    const solicitacao = await prisma.solicitacao.create({
      data: {
        numeroSolicitacao: gerarNumeroSolicitacao(),
        solicitanteId: userId,
        centroCustoId: parseInt(centroCustoId),
        justificativa,
        enderecoEntrega,
        prazoEntrega: prazoEntrega ? new Date(prazoEntrega) : null,
        finalidade,
        valorTotal,
        observacoes,
        status: StatusSolicitacao.PENDENTE,
        itens: {
          create: itensValidados,
        },
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        centroCusto: true,
        itens: {
          include: {
            brinde: true,
          },
        },
      },
    });

    res.status(201).json(solicitacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userPerfil = req.userPerfil;
    const { status, justificativa, enderecoEntrega, prazoEntrega, finalidade, observacoes, dataEntrega } = req.body;

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: parseInt(id) },
    });

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar permissões
    if (userPerfil !== 'MARKETING' && userPerfil !== 'DIRETOR' && solicitacao.solicitanteId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Apenas Marketing pode marcar como entregue
    if (status === StatusSolicitacao.ENTREGUE && userPerfil !== 'MARKETING') {
      return res.status(403).json({ error: 'Apenas Marketing pode marcar como entregue' });
    }

    const data: any = {};

    if (status) data.status = status as StatusSolicitacao;
    if (justificativa !== undefined) data.justificativa = justificativa;
    if (enderecoEntrega !== undefined) data.enderecoEntrega = enderecoEntrega;
    if (prazoEntrega !== undefined) data.prazoEntrega = prazoEntrega ? new Date(prazoEntrega) : null;
    if (finalidade !== undefined) data.finalidade = finalidade;
    if (observacoes !== undefined) data.observacoes = observacoes;
    if (dataEntrega !== undefined) data.dataEntrega = dataEntrega ? new Date(dataEntrega) : null;

    const solicitacaoAtualizada = await prisma.solicitacao.update({
      where: { id: parseInt(id) },
      data,
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        centroCusto: true,
        itens: {
          include: {
            brinde: true,
          },
        },
      },
    });

    // Se aprovada, atualizar orçamento utilizado
    if (status === StatusSolicitacao.APROVADA && solicitacao.status !== StatusSolicitacao.APROVADA) {
      await prisma.centroCusto.update({
        where: { id: solicitacao.centroCustoId },
        data: {
          orcamentoUtilizado: {
            increment: solicitacao.valorTotal || 0,
          },
        },
      });
    }

    res.json(solicitacaoAtualizada);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelarSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userPerfil = req.userPerfil;

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: parseInt(id) },
    });

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar permissões
    if (userPerfil !== 'MARKETING' && userPerfil !== 'DIRETOR' && solicitacao.solicitanteId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Só pode cancelar se estiver pendente ou aprovada
    if (solicitacao.status === StatusSolicitacao.ENTREGUE) {
      return res.status(400).json({ error: 'Não é possível cancelar uma solicitação já entregue' });
    }

    const solicitacaoCancelada = await prisma.solicitacao.update({
      where: { id: parseInt(id) },
      data: {
        status: StatusSolicitacao.CANCELADA,
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        centroCusto: true,
        itens: {
          include: {
            brinde: true,
          },
        },
      },
    });

    // Se estava aprovada, reverter orçamento utilizado
    if (solicitacao.status === StatusSolicitacao.APROVADA) {
      await prisma.centroCusto.update({
        where: { id: solicitacao.centroCustoId },
        data: {
          orcamentoUtilizado: {
            decrement: solicitacao.valorTotal || 0,
          },
        },
      });
    }

    res.json(solicitacaoCancelada);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

