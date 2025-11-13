import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { StatusSolicitacao, StatusAprovacao, PerfilUsuario } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export const aprovarSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { observacao } = req.body;
    const aprovadorId = req.userId!;
    const aprovadorPerfil = req.userPerfil!;

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        centroCusto: true,
        itens: {
          include: {
            brinde: true,
          },
        },
        aprovacoes: true,
      },
    });

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      return res.status(400).json({ error: 'Solicitação não está pendente de aprovação' });
    }

    // Verificar se precisa de aprovação
    const centroCusto = solicitacao.centroCusto;
    const valorTotal = solicitacao.valorTotal || 0;

    // Verificar limites
    let precisaAprovacaoDiretor = false;
    
    if (centroCusto.limitePorGerente && valorTotal > centroCusto.limitePorGerente) {
      precisaAprovacaoDiretor = true;
    }

    if (centroCusto.limitePorEvento && valorTotal > centroCusto.limitePorEvento) {
      precisaAprovacaoDiretor = true;
    }

    // Verificar permissões
    if (precisaAprovacaoDiretor && aprovadorPerfil !== 'DIRETOR') {
      return res.status(403).json({ 
        error: 'Esta solicitação requer aprovação de Diretor',
        valorTotal,
        limites: {
          limitePorGerente: centroCusto.limitePorGerente,
          limitePorEvento: centroCusto.limitePorEvento,
        },
      });
    }

    if (!precisaAprovacaoDiretor && aprovadorPerfil !== 'GERENTE' && aprovadorPerfil !== 'DIRETOR') {
      return res.status(403).json({ error: 'Apenas Gerentes ou Diretores podem aprovar' });
    }

    // Validar estoque
    for (const item of solicitacao.itens) {
      if (item.brinde.quantidade < item.quantidade) {
        return res.status(400).json({ 
          error: `Estoque insuficiente para ${item.brinde.nome}. Disponível: ${item.brinde.quantidade}` 
        });
      }
    }

    const itensParaAtualizar = solicitacao.itens.map(item => ({
      brindeId: item.brindeId,
      quantidade: item.quantidade,
    }));

    // Criar aprovação e atualizar solicitação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar registro de aprovação
      await tx.aprovacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          aprovadorId,
          status: StatusAprovacao.APROVADA,
          observacao,
          nivelAprovacao: aprovadorPerfil === 'DIRETOR' ? 2 : 1,
        },
      });

      // Atualizar status da solicitação
      await tx.solicitacao.update({
        where: { id: solicitacao.id },
        data: {
          status: StatusSolicitacao.APROVADA,
        },
      });

      // Atualizar orçamento utilizado
      await tx.centroCusto.update({
        where: { id: solicitacao.centroCustoId },
        data: {
          orcamentoUtilizado: {
            increment: valorTotal,
          },
        },
      });

      // Reduzir estoque dos brindes
      for (const item of itensParaAtualizar) {
        await tx.brinde.update({
          where: { id: item.brindeId },
          data: {
            quantidade: {
              decrement: item.quantidade,
            },
          },
        });
      }

      const solicitacaoResultado = await tx.solicitacao.findUnique({
        where: { id: solicitacao.id },
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
          },
        },
      });

      if (!solicitacaoResultado) {
        throw new Error('Solicitação não encontrada após aprovação.');
      }

      return solicitacaoResultado;
    });

    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejeitarSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { observacao } = req.body;
    const aprovadorId = req.userId!;
    const aprovadorPerfil = req.userPerfil!;

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: parseInt(id) },
    });

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      return res.status(400).json({ error: 'Solicitação não está pendente' });
    }

    // Verificar permissões
    if (aprovadorPerfil !== 'GERENTE' && aprovadorPerfil !== 'DIRETOR') {
      return res.status(403).json({ error: 'Apenas Gerentes ou Diretores podem rejeitar' });
    }

    // Criar registro de rejeição e atualizar solicitação
    const resultado = await prisma.$transaction(async (tx) => {
      const aprovacao = await tx.aprovacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          aprovadorId,
          status: StatusAprovacao.REJEITADA,
          observacao,
          nivelAprovacao: aprovadorPerfil === 'DIRETOR' ? 2 : 1,
        },
      });

      const solicitacaoAtualizada = await tx.solicitacao.update({
        where: { id: solicitacao.id },
        data: {
          status: StatusSolicitacao.REJEITADA,
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
          },
        },
      });

      return solicitacaoAtualizada;
    });

    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAprovacoesBySolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { solicitacaoId } = req.params;

    const aprovacoes = await prisma.aprovacao.findMany({
      where: { solicitacaoId: parseInt(solicitacaoId) },
      include: {
        aprovador: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        solicitacao: {
          select: {
            id: true,
            numeroSolicitacao: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(aprovacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

