import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  solicitacoesService,
  EntregarSolicitacaoPayload,
} from '../../../services/solicitacoes.service';
import { solicitacoesKeys } from './keys';

interface RegistrarEntregaArgs {
  solicitacaoId: number;
  payload: EntregarSolicitacaoPayload;
}

export const useRegistrarEntregaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ solicitacaoId, payload }: RegistrarEntregaArgs) =>
      solicitacoesService.entregar(solicitacaoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: solicitacoesKeys.all,
      });
    },
  });
};


