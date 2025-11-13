import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aprovacoesService } from '../../../services/aprovacoes.service';
import { solicitacoesKeys } from '../../solicitacoes/api/keys';

interface RejeitarPayload {
  solicitacaoId: number;
  observacao: string;
}

export const useRejeitarSolicitacaoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ solicitacaoId, observacao }: RejeitarPayload) =>
      aprovacoesService.rejeitar(solicitacaoId, { observacao }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: solicitacoesKeys.all,
      });
    },
  });
};


