import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { SolicitacaoService } from '../services/solicitacao.service';

export const aprovarSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { observacao } = req.body;
    const aprovadorId = req.userId!;
    const aprovadorPerfil = req.userPerfil!;

    try {
      const solicitacaoAtualizada = await SolicitacaoService.aprovarSolicitacao({
        solicitacaoId: parseInt(id),
        aprovadorId,
        aprovadorPerfil,
        observacao,
      });

      if (!solicitacaoAtualizada) {
        return res.status(404).json({ error: 'Solicitação não encontrada após aprovação' });
      }

      res.json(solicitacaoAtualizada);
    } catch (error: any) {
      if (error.message === 'Solicitação não encontrada') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message?.includes('Estoque insuficiente')) {
        return res.status(400).json({ error: error.message });
      }

      if (
        error.message === 'Esta solicitação requer aprovação de Diretor' ||
        error.message === 'Apenas Gerentes ou Diretores podem aprovar'
      ) {
        return res.status(403).json({ error: error.message });
      }

      if (error.message === 'Solicitação não está pendente de aprovação') {
        return res.status(400).json({ error: error.message });
      }

      throw error;
    }
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

    try {
      const resultado = await SolicitacaoService.rejeitarSolicitacao({
        solicitacaoId: parseInt(id),
        aprovadorId,
        aprovadorPerfil,
        observacao,
      });

      res.json(resultado);
    } catch (error: any) {
      if (error.message === 'Solicitação não encontrada') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === 'Solicitação não está pendente') {
        return res.status(400).json({ error: error.message });
      }

      if (error.message === 'Apenas Gerentes ou Diretores podem rejeitar') {
        return res.status(403).json({ error: error.message });
      }

      throw error;
    }
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

