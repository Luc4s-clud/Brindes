import { Prisma, StatusSolicitacao } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class SolicitacaoService {
  static async listarSolicitacoes(params: {
    status?: string;
    centroCustoId?: number;
    solicitanteId?: number;
    usuarioId?: number;
    usuarioPerfil?: string;
  }) {
    const { status, centroCustoId, solicitanteId, usuarioId, usuarioPerfil } = params;

    const where: Prisma.SolicitacaoWhereInput = {};

    if (usuarioPerfil !== 'MARKETING' && usuarioPerfil !== 'DIRETOR') {
      where.solicitanteId = usuarioId;
    }

    if (status) {
      where.status = status as StatusSolicitacao;
    }

    if (centroCustoId) {
      where.centroCustoId = centroCustoId;
    }

    if (solicitanteId && (usuarioPerfil === 'MARKETING' || usuarioPerfil === 'DIRETOR')) {
      where.solicitanteId = solicitanteId;
    }

    return prisma.solicitacao.findMany({
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
  }

  static async obterSolicitacaoDetalhe(id: number, usuarioId?: number, usuarioPerfil?: string) {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id },
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
      return null;
    }

    if (
      usuarioPerfil !== 'MARKETING' &&
      usuarioPerfil !== 'DIRETOR' &&
      solicitacao.solicitanteId !== usuarioId
    ) {
      throw new Error('Acesso negado');
    }

    return solicitacao;
  }

  static async aprovarSolicitacao({
    solicitacaoId,
    aprovadorId,
    aprovadorPerfil,
    observacao,
  }: {
    solicitacaoId: number;
    aprovadorId: number;
    aprovadorPerfil: string;
    observacao?: string;
  }) {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: solicitacaoId },
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
      throw new Error('Solicitação não encontrada');
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new Error('Solicitação não está pendente de aprovação');
    }

    const valorTotal = solicitacao.valorTotal || 0;
    const centroCusto = solicitacao.centroCusto;

    let precisaAprovacaoDiretor = false;

    if (centroCusto.limitePorGerente && valorTotal > centroCusto.limitePorGerente) {
      precisaAprovacaoDiretor = true;
    }

    if (centroCusto.limitePorEvento && valorTotal > centroCusto.limitePorEvento) {
      precisaAprovacaoDiretor = true;
    }

    if (precisaAprovacaoDiretor && aprovadorPerfil !== 'DIRETOR') {
      throw new Error('Esta solicitação requer aprovação de Diretor');
    }

    if (!precisaAprovacaoDiretor && aprovadorPerfil !== 'GERENTE' && aprovadorPerfil !== 'DIRETOR') {
      throw new Error('Apenas Gerentes ou Diretores podem aprovar');
    }

    for (const item of solicitacao.itens) {
      if (item.brinde.quantidade < item.quantidade) {
        throw new Error(
          `Estoque insuficiente para ${item.brinde.nome}. Disponível: ${item.brinde.quantidade}`,
        );
      }
    }

    const MAX_ATTEMPTS = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        await prisma.$transaction(
          async (tx) => {
            await tx.aprovacao.create({
              data: {
                solicitacaoId: solicitacao.id,
                aprovadorId,
                status: 'APROVADA',
                observacao,
                nivelAprovacao: aprovadorPerfil === 'DIRETOR' ? 2 : 1,
              },
            });

            await tx.solicitacao.update({
              where: { id: solicitacao.id },
              data: {
                status: StatusSolicitacao.APROVADA,
              },
            });

            await tx.centroCusto.update({
              where: { id: solicitacao.centroCustoId },
              data: {
                orcamentoUtilizado: {
                  increment: valorTotal,
                },
              },
            });

            await Promise.all(
              solicitacao.itens.map((item) =>
                tx.brinde.update({
                  where: { id: item.brindeId },
                  data: {
                    quantidade: {
                      decrement: item.quantidade,
                    },
                  },
                }),
              ),
            );
          },
          {
            timeout: 20000,
            maxWait: 3000,
          },
        );

        lastError = null;
        break;
      } catch (error: any) {
        lastError = error;
        if (
          (error?.code === 'P2034' || error?.message?.includes('Transaction failed')) &&
          attempt < MAX_ATTEMPTS
        ) {
          continue;
        }
        throw error;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return prisma.solicitacao.findUnique({
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
  }

  static async rejeitarSolicitacao({
    solicitacaoId,
    aprovadorId,
    aprovadorPerfil,
    observacao,
  }: {
    solicitacaoId: number;
    aprovadorId: number;
    aprovadorPerfil: string;
    observacao: string;
  }) {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: solicitacaoId },
    });

    if (!solicitacao) {
      throw new Error('Solicitação não encontrada');
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new Error('Solicitação não está pendente');
    }

    if (aprovadorPerfil !== 'GERENTE' && aprovadorPerfil !== 'DIRETOR') {
      throw new Error('Apenas Gerentes ou Diretores podem rejeitar');
    }

    await prisma.$transaction(async (tx) => {
      await tx.aprovacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          aprovadorId,
          status: 'REJEITADA',
          observacao,
          nivelAprovacao: aprovadorPerfil === 'DIRETOR' ? 2 : 1,
        },
      });

      await tx.solicitacao.update({
        where: { id: solicitacao.id },
        data: {
          status: StatusSolicitacao.REJEITADA,
        },
      });
    });

    return prisma.solicitacao.findUnique({
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
  }

  static async registrarEntrega({
    solicitacaoId,
    itensEntregues,
    dataEntrega,
    observacaoEntrega,
  }: {
    solicitacaoId: number;
    itensEntregues?: Array<{ itemId: number; quantidadeEntregue: number }>;
    dataEntrega?: Date | null;
    observacaoEntrega?: string;
  }) {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: solicitacaoId },
      include: {
        itens: true,
      },
    });

    if (!solicitacao) {
      throw new Error('Solicitação não encontrada');
    }

    if (
      solicitacao.status !== StatusSolicitacao.APROVADA &&
      solicitacao.status !== StatusSolicitacao.ENTREGUE
    ) {
      throw new Error('Apenas solicitações aprovadas podem ser marcadas como entregues');
    }

    const mapEntregas = new Map<number, number>();

    if (Array.isArray(itensEntregues)) {
      for (const item of itensEntregues) {
        mapEntregas.set(item.itemId, item.quantidadeEntregue);
      }
    }

    const atualizacoesItens = solicitacao.itens.map((item) => {
      const quantidadeEntregue =
        mapEntregas.size > 0
          ? mapEntregas.get(item.id) ?? item.quantidade
          : item.quantidade;

      if (quantidadeEntregue > item.quantidade) {
        throw new Error(
          `Quantidade entregue do item ${item.id} não pode ser maior que a solicitada`,
        );
      }

      return {
        itemId: item.id,
        quantidadeEntregue,
      };
    });

    await prisma.$transaction(async (tx) => {
      for (const item of atualizacoesItens) {
        await tx.itemSolicitacao.update({
          where: { id: item.itemId },
          data: {
            quantidadeEntregue: item.quantidadeEntregue,
          },
        });
      }

      await tx.solicitacao.update({
        where: { id: solicitacao.id },
        data: {
          status: StatusSolicitacao.ENTREGUE,
          dataEntrega: dataEntrega ?? new Date(),
          observacoes:
            observacaoEntrega !== undefined
              ? observacaoEntrega
              : solicitacao.observacoes,
        },
      });
    });

    return prisma.solicitacao.findUnique({
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}


