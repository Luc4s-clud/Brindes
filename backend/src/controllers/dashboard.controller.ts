import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { StatusSolicitacao } from '@prisma/client';

export const getEstatisticas = async (req: Request, res: Response) => {
  try {
    // Estatísticas de brindes
    const totalBrindes = await prisma.brinde.count({
      where: { ativo: true },
    });

    const brindesComEstoque = await prisma.brinde.count({
      where: {
        ativo: true,
        quantidade: { gt: 0 },
      },
    });

    // Buscar brindes com estoque baixo (usando query raw para comparar)
    const brindesComEstoqueMinimo = await prisma.brinde.findMany({
      where: {
        ativo: true,
        estoqueMinimo: { not: null },
      },
      select: {
        id: true,
        quantidade: true,
        estoqueMinimo: true,
      },
    });

    const brindesEstoqueBaixo = brindesComEstoqueMinimo.filter(
      b => b.estoqueMinimo && b.quantidade <= b.estoqueMinimo
    ).length + await prisma.brinde.count({
      where: {
        ativo: true,
        quantidade: 0,
        estoqueMinimo: null,
      },
    });

    const brindesVencendo = await prisma.brinde.count({
      where: {
        ativo: true,
        validade: {
          lte: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          gte: new Date(),
        },
      },
    });

    // Remover agregação não utilizada

    const valorTotalEstoqueRaw = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT SUM(quantidade * COALESCE(valorUnitario, 0)) as total
      FROM brindes
      WHERE ativo = true
    `;
    const valorTotalEstoque = valorTotalEstoqueRaw[0]?.total ? Number(valorTotalEstoqueRaw[0].total) : 0;

    // Estatísticas de solicitações
    const totalSolicitacoes = await prisma.solicitacao.count();
    const solicitacoesPendentes = await prisma.solicitacao.count({
      where: { status: StatusSolicitacao.PENDENTE },
    });
    const solicitacoesAprovadas = await prisma.solicitacao.count({
      where: { status: StatusSolicitacao.APROVADA },
    });
    const solicitacoesEntregues = await prisma.solicitacao.count({
      where: { status: StatusSolicitacao.ENTREGUE },
    });

    // Valor total de solicitações aprovadas
    const valorTotalAprovado = await prisma.solicitacao.aggregate({
      where: { status: StatusSolicitacao.APROVADA },
      _sum: {
        valorTotal: true,
      },
    });

    const valorTotalEntregue = await prisma.solicitacao.aggregate({
      where: { status: StatusSolicitacao.ENTREGUE },
      _sum: {
        valorTotal: true,
      },
    });

    // Top 5 brindes mais solicitados
    const brindesMaisSolicitados = await prisma.itemSolicitacao.groupBy({
      by: ['brindeId'],
      _sum: {
        quantidade: true,
      },
      orderBy: {
        _sum: {
          quantidade: 'desc',
        },
      },
      take: 5,
    });

    const brindesMaisSolicitadosDetalhes = await Promise.all(
      brindesMaisSolicitados.map(async (item) => {
        const brinde = await prisma.brinde.findUnique({
          where: { id: item.brindeId },
        });
        return {
          brinde: {
            id: brinde?.id,
            nome: brinde?.nome,
            codigo: brinde?.codigo,
          },
          quantidadeTotal: item._sum.quantidade,
        };
      })
    );

    // Top 5 solicitantes
    const topSolicitantes = await prisma.solicitacao.groupBy({
      by: ['solicitanteId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const topSolicitantesDetalhes = await Promise.all(
      topSolicitantes.map(async (item) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: item.solicitanteId },
        });
        return {
          usuario: {
            id: usuario?.id,
            nome: usuario?.nome,
            email: usuario?.email,
          },
          totalSolicitacoes: item._count.id,
        };
      })
    );

    // Consumo por centro de custo
    const consumoPorCentroCusto = await prisma.solicitacao.groupBy({
      by: ['centroCustoId'],
      _sum: {
        valorTotal: true,
      },
      where: {
        status: {
          in: [StatusSolicitacao.APROVADA, StatusSolicitacao.ENTREGUE],
        },
      },
    });

    const consumoPorCentroCustoDetalhes = await Promise.all(
      consumoPorCentroCusto.map(async (item) => {
        const centroCusto = await prisma.centroCusto.findUnique({
          where: { id: item.centroCustoId },
        });
        return {
          centroCusto: {
            id: centroCusto?.id,
            nome: centroCusto?.nome,
            setor: centroCusto?.setor,
          },
          valorTotal: item._sum.valorTotal,
        };
      })
    );

    res.json({
      brindes: {
        total: totalBrindes,
        comEstoque: brindesComEstoque,
        estoqueBaixo: brindesEstoqueBaixo,
        vencendo: brindesVencendo,
        valorTotalEstoque: valorTotalEstoque,
      },
      solicitacoes: {
        total: totalSolicitacoes,
        pendentes: solicitacoesPendentes,
        aprovadas: solicitacoesAprovadas,
        entregues: solicitacoesEntregues,
        valorTotalAprovado: valorTotalAprovado,
        valorTotalEntregue: valorTotalEntregue,
      },
      rankings: {
        brindesMaisSolicitados: brindesMaisSolicitadosDetalhes,
        topSolicitantes: topSolicitantesDetalhes,
        consumoPorCentroCusto: consumoPorCentroCustoDetalhes,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRelatorioConsumo = async (req: Request, res: Response) => {
  try {
    const { inicio, fim, centroCustoId, solicitanteId } = req.query;

    const where: any = {
      status: {
        in: [StatusSolicitacao.APROVADA, StatusSolicitacao.ENTREGUE],
      },
    };

    if (inicio && fim) {
      where.createdAt = {
        gte: new Date(inicio as string),
        lte: new Date(fim as string),
      };
    }

    if (centroCustoId) {
      where.centroCustoId = parseInt(centroCustoId as string);
    }

    if (solicitanteId) {
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
            setor: true,
          },
        },
        centroCusto: {
          select: {
            id: true,
            nome: true,
            setor: true,
          },
        },
        itens: {
          include: {
            brinde: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                categoria: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(solicitacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

