import { Router } from 'express';
import {
  aprovarSolicitacao,
  rejeitarSolicitacao,
  getAprovacoesBySolicitacao,
} from '../controllers/aprovacoes.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post('/:id/aprovar', authorize('GERENTE', 'DIRETOR'), aprovarSolicitacao);
router.post('/:id/rejeitar', authorize('GERENTE', 'DIRETOR'), rejeitarSolicitacao);
router.get('/solicitacao/:solicitacaoId', getAprovacoesBySolicitacao);

export default router;

