import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllCentrosCusto = async (req: Request, res: Response) => {
  try {
    const { setor, ativo } = req.query;
    
    const where: any = {};
    
    if (setor) {
      where.setor = setor as string;
    }
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const centrosCusto = await prisma.centroCusto.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        solicitacoes: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { nome: 'asc' },
    });

    res.json(centrosCusto);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCentroCustoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const centroCusto = await prisma.centroCusto.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        solicitacoes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!centroCusto) {
      return res.status(404).json({ error: 'Centro de custo não encontrado' });
    }

    res.json(centroCusto);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCentroCusto = async (req: Request, res: Response) => {
  try {
    const { nome, descricao, orcamentoTotal, limitePorGerente, limitePorEvento, limitePorSetor, setor, usuarioId } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const centroCusto = await prisma.centroCusto.create({
      data: {
        nome,
        descricao,
        orcamentoTotal: orcamentoTotal ? parseFloat(orcamentoTotal) : null,
        limitePorGerente: limitePorGerente ? parseFloat(limitePorGerente) : null,
        limitePorEvento: limitePorEvento ? parseFloat(limitePorEvento) : null,
        limitePorSetor: limitePorSetor ? parseFloat(limitePorSetor) : null,
        setor,
        usuarioId: usuarioId ? parseInt(usuarioId) : null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(centroCusto);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Centro de custo já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateCentroCusto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, orcamentoTotal, limitePorGerente, limitePorEvento, limitePorSetor, setor, usuarioId, ativo } = req.body;

    const data: any = {};

    if (nome) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (orcamentoTotal !== undefined) data.orcamentoTotal = orcamentoTotal ? parseFloat(orcamentoTotal) : null;
    if (limitePorGerente !== undefined) data.limitePorGerente = limitePorGerente ? parseFloat(limitePorGerente) : null;
    if (limitePorEvento !== undefined) data.limitePorEvento = limitePorEvento ? parseFloat(limitePorEvento) : null;
    if (limitePorSetor !== undefined) data.limitePorSetor = limitePorSetor ? parseFloat(limitePorSetor) : null;
    if (setor !== undefined) data.setor = setor;
    if (usuarioId !== undefined) data.usuarioId = usuarioId ? parseInt(usuarioId) : null;
    if (ativo !== undefined) data.ativo = ativo;

    const centroCusto = await prisma.centroCusto.update({
      where: { id: parseInt(id) },
      data,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.json(centroCusto);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Centro de custo não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Centro de custo já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteCentroCusto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.centroCusto.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Centro de custo excluído com sucesso' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Centro de custo não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

