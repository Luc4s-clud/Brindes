import { Router } from 'express';
import {
  getAllRecomendacoes,
  getRecomendacaoById,
  createRecomendacao,
  updateRecomendacao,
  deleteRecomendacao,
} from '../controllers/recomendacoes.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Listar e criar podem ser feitos sem autenticação (para permitir sugestões públicas)
router.get('/', getAllRecomendacoes);
router.get('/:id', getRecomendacaoById);
router.post('/', createRecomendacao);

// Atualizar e excluir requerem autenticação
router.put('/:id', authenticate, updateRecomendacao);
router.delete('/:id', authenticate, deleteRecomendacao);

export default router;

