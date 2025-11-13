import { afterEach, describe, expect, it, vi } from 'vitest';
import { SolicitacaoService } from '../solicitacao.service';
import { prisma } from '../../utils/prisma';

vi.mock('../../utils/prisma', () => ({
  prisma: {
    solicitacao: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('SolicitacaoService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('restringe busca de solicitações para usuários comuns', async () => {
    const findManyMock = vi.mocked(prisma.solicitacao.findMany);
    findManyMock.mockResolvedValue([]);

    await SolicitacaoService.listarSolicitacoes({
      usuarioId: 10,
      usuarioPerfil: 'SOLICITANTE',
    });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          solicitanteId: 10,
        }),
      }),
    );
  });

  it('permite que marketing visualize todas as solicitações', async () => {
    const findManyMock = vi.mocked(prisma.solicitacao.findMany);
    findManyMock.mockResolvedValue([]);

    await SolicitacaoService.listarSolicitacoes({
      usuarioPerfil: 'MARKETING',
    });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          solicitanteId: expect.any(Number),
        }),
      }),
    );
  });
});


