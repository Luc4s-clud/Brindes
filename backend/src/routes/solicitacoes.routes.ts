import { Router } from 'express';
import {
  getAllSolicitacoes,
  getSolicitacaoById,
  createSolicitacao,
  updateSolicitacao,
  cancelarSolicitacao,
} from '../controllers/solicitacoes.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', getAllSolicitacoes);
router.get('/:id', getSolicitacaoById);
router.post('/', createSolicitacao);
router.put('/:id', updateSolicitacao);
router.patch('/:id/cancelar', cancelarSolicitacao);

export default router;

