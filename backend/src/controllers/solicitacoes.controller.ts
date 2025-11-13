import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { StatusSolicitacao } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { SolicitacaoService } from '../services/solicitacao.service';

// Gerar número único de solicitação
function gerarNumeroSolicitacao(): string {
  const ano = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `SOL-${ano}-${timestamp}`;
}

export const getAllSolicitacoes = async (req: AuthRequest, res: Response) => {
  try {
    const { status, centroCustoId, solicitanteId } = req.query;

    const solicitacoes = await SolicitacaoService.listarSolicitacoes({
      status: status as string | undefined,
      centroCustoId: centroCustoId ? parseInt(centroCustoId as string) : undefined,
      solicitanteId: solicitanteId ? parseInt(solicitanteId as string) : undefined,
      usuarioId: req.userId,
      usuarioPerfil: req.userPerfil,
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

    const solicitacao = await SolicitacaoService.obterSolicitacaoDetalhe(
      parseInt(id),
      userId,
      userPerfil,
    );

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    res.json(solicitacao);
  } catch (error: any) {
    const message = error.message === 'Acesso negado' ? error.message : 'Erro ao buscar solicitação';
    const status = error.message === 'Acesso negado' ? 403 : 500;
    res.status(status).json({ error: message });
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

export const entregarSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { itensEntregues, dataEntrega, observacaoEntrega } = req.body ?? {};
    const userPerfil = req.userPerfil;

    if (userPerfil !== 'MARKETING' && userPerfil !== 'DIRETOR') {
      return res.status(403).json({ error: 'Apenas Marketing ou Diretoria podem registrar entregas' });
    }

    try {
      const solicitacaoAtualizada = await SolicitacaoService.registrarEntrega({
        solicitacaoId: parseInt(id),
        itensEntregues,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : undefined,
        observacaoEntrega,
      });

      res.json(solicitacaoAtualizada);
    } catch (error: any) {
      if (error.message === 'Solicitação não encontrada') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message?.includes('Apenas solicitações aprovadas')) {
        return res.status(400).json({ error: error.message });
      }

      if (error.message?.includes('Quantidade entregue')) {
        return res.status(400).json({ error: error.message });
      }

      throw error;
    }
  } catch (error: any) {
    if (error.message?.includes('Quantidade entregue')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

