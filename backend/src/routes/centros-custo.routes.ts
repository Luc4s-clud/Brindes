import { Router } from 'express';
import {
  getAllCentrosCusto,
  getCentroCustoById,
  createCentroCusto,
  updateCentroCusto,
  deleteCentroCusto,
} from '../controllers/centros-custo.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', getAllCentrosCusto);
router.get('/:id', getCentroCustoById);
router.post('/', authorize('MARKETING', 'DIRETOR'), createCentroCusto);
router.put('/:id', authorize('MARKETING', 'DIRETOR'), updateCentroCusto);
router.delete('/:id', authorize('MARKETING', 'DIRETOR'), deleteCentroCusto);

export default router;

