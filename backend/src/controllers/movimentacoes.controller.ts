import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { TipoMovimentacao } from '@prisma/client';

export const getAllMovimentacoes = async (req: Request, res: Response) => {
  try {
    const movimentacoes = await prisma.movimentacao.findMany({
      include: { brinde: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(movimentacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMovimentacoesByBrinde = async (req: Request, res: Response) => {
  try {
    const { brindeId } = req.params;
    const movimentacoes = await prisma.movimentacao.findMany({
      where: { brindeId: parseInt(brindeId) },
      include: { brinde: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(movimentacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMovimentacao = async (req: Request, res: Response) => {
  try {
    const { brindeId, tipo, quantidade, motivo, observacao } = req.body;

    // Verificar se o brinde existe
    const brinde = await prisma.brinde.findUnique({
      where: { id: brindeId },
    });

    if (!brinde) {
      return res.status(404).json({ error: 'Brinde não encontrado' });
    }

    // Converter string para enum se necessário (compatibilidade)
    const tipoEnum: TipoMovimentacao = tipo === 'entrada' || tipo === TipoMovimentacao.ENTRADA 
      ? TipoMovimentacao.ENTRADA 
      : TipoMovimentacao.SAIDA;

    // Validar quantidade
    if (tipoEnum === TipoMovimentacao.SAIDA && brinde.quantidade < quantidade) {
      return res.status(400).json({ 
        error: 'Quantidade insuficiente em estoque',
        disponivel: brinde.quantidade 
      });
    }

    // Criar movimentação e atualizar estoque em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      const movimentacao = await tx.movimentacao.create({
        data: {
          brindeId,
          tipo: tipoEnum,
          quantidade,
          motivo,
          observacao,
        },
        include: { brinde: true },
      });

      // Atualizar quantidade do brinde
      const novaQuantidade = tipoEnum === TipoMovimentacao.ENTRADA 
        ? brinde.quantidade + quantidade 
        : brinde.quantidade - quantidade;

      await tx.brinde.update({
        where: { id: brindeId },
        data: { quantidade: novaQuantidade },
      });

      return movimentacao;
    });

    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

