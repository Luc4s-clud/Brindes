import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { StatusSolicitacao } from '@prisma/client';

export const getEstatisticas = async (req: Request, res: Response) => {
  try {
    const agora = new Date();
    const daquiUmMes = new Date(agora);
    daquiUmMes.setMonth(daquiUmMes.getMonth() + 1);

    const [
      totalBrindes,
      brindesComEstoque,
      brindesComEstoqueMinimo,
      brindesSemEstoqueSemMinimo,
      brindesVencendo,
      valorTotalEstoqueRaw,
      totalSolicitacoes,
      solicitacoesPendentes,
      solicitacoesAprovadas,
      solicitacoesEntregues,
      valorTotalAprovado,
      valorTotalEntregue,
      brindesMaisSolicitados,
      topSolicitantes,
      consumoPorCentroCusto,
    ] = await Promise.all([
      prisma.brinde.count({
        where: { ativo: true },
      }),
      prisma.brinde.count({
        where: {
          ativo: true,
          quantidade: { gt: 0 },
        },
      }),
      prisma.brinde.findMany({
        where: {
          ativo: true,
          estoqueMinimo: { not: null },
        },
        select: {
          id: true,
          quantidade: true,
          estoqueMinimo: true,
        },
      }),
      prisma.brinde.count({
        where: {
          ativo: true,
          quantidade: 0,
          estoqueMinimo: null,
        },
      }),
      prisma.brinde.count({
        where: {
          ativo: true,
          validade: {
            lte: daquiUmMes,
            gte: agora,
          },
        },
      }),
      prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT SUM(quantidade * COALESCE(valorUnitario, 0)) as total
        FROM brindes
        WHERE ativo = true
      `,
      prisma.solicitacao.count(),
      prisma.solicitacao.count({
        where: { status: StatusSolicitacao.PENDENTE },
      }),
      prisma.solicitacao.count({
        where: { status: StatusSolicitacao.APROVADA },
      }),
      prisma.solicitacao.count({
        where: { status: StatusSolicitacao.ENTREGUE },
      }),
      prisma.solicitacao.aggregate({
        where: { status: StatusSolicitacao.APROVADA },
        _sum: {
          valorTotal: true,
        },
      }),
      prisma.solicitacao.aggregate({
        where: { status: StatusSolicitacao.ENTREGUE },
        _sum: {
          valorTotal: true,
        },
      }),
      prisma.itemSolicitacao.groupBy({
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
      }),
      prisma.solicitacao.groupBy({
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
      }),
      prisma.solicitacao.groupBy({
        by: ['centroCustoId'],
        _sum: {
          valorTotal: true,
        },
        where: {
          status: {
            in: [StatusSolicitacao.APROVADA, StatusSolicitacao.ENTREGUE],
          },
        },
      }),
    ]);

    const brindesEstoqueBaixo =
      brindesComEstoqueMinimo.filter(
        (b) => b.estoqueMinimo !== null && b.quantidade <= (b.estoqueMinimo ?? 0),
      ).length + brindesSemEstoqueSemMinimo;

    const valorTotalEstoque =
      (valorTotalEstoqueRaw as Array<{ total: bigint }>)[0]?.total
        ? Number((valorTotalEstoqueRaw as Array<{ total: bigint }>)[0].total)
        : 0;

    const brindeIds = brindesMaisSolicitados.map((item) => item.brindeId).filter(Boolean);
    const solicitanteIds = topSolicitantes.map((item) => item.solicitanteId).filter(Boolean);
    const centrosCustoIds = consumoPorCentroCusto.map((item) => item.centroCustoId).filter(Boolean);

    const [brindesDetalhes, usuariosDetalhes, centrosDetalhes] = await Promise.all([
      brindeIds.length
        ? prisma.brinde.findMany({
            where: { id: { in: brindeIds } },
            select: {
              id: true,
              nome: true,
              codigo: true,
            },
          })
        : [],
      solicitanteIds.length
        ? prisma.usuario.findMany({
            where: { id: { in: solicitanteIds } },
            select: {
              id: true,
              nome: true,
              email: true,
            },
          })
        : [],
      centrosCustoIds.length
        ? prisma.centroCusto.findMany({
            where: { id: { in: centrosCustoIds } },
            select: {
              id: true,
              nome: true,
              setor: true,
            },
          })
        : [],
    ]);

    const brindesMap = new Map(brindesDetalhes.map((brinde) => [brinde.id, brinde]));
    const usuariosMap = new Map(usuariosDetalhes.map((usuario) => [usuario.id, usuario]));
    const centrosMap = new Map(centrosDetalhes.map((centro) => [centro.id, centro]));

    const brindesMaisSolicitadosDetalhes = brindesMaisSolicitados.map((item) => ({
      brinde: {
        id: item.brindeId,
        nome: brindesMap.get(item.brindeId)?.nome,
        codigo: brindesMap.get(item.brindeId)?.codigo,
      },
      quantidadeTotal: item._sum.quantidade,
    }));

    const topSolicitantesDetalhes = topSolicitantes.map((item) => ({
      usuario: {
        id: item.solicitanteId,
        nome: usuariosMap.get(item.solicitanteId)?.nome,
        email: usuariosMap.get(item.solicitanteId)?.email,
      },
      totalSolicitacoes: item._count.id,
    }));

    const consumoPorCentroCustoDetalhes = consumoPorCentroCusto.map((item) => ({
      centroCusto: {
        id: item.centroCustoId,
        nome: centrosMap.get(item.centroCustoId)?.nome,
        setor: centrosMap.get(item.centroCustoId)?.setor,
      },
      valorTotal: item._sum.valorTotal,
    }));

    res.json({
      brindes: {
        total: totalBrindes,
        comEstoque: brindesComEstoque,
        estoqueBaixo: brindesEstoqueBaixo,
        vencendo: brindesVencendo,
        valorTotalEstoque,
      },
      solicitacoes: {
        total: totalSolicitacoes,
        pendentes: solicitacoesPendentes,
        aprovadas: solicitacoesAprovadas,
        entregues: solicitacoesEntregues,
        valorTotalAprovado,
        valorTotalEntregue,
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

