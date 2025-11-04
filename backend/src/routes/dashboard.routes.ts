import { Router } from 'express';
import { getEstatisticas, getRelatorioConsumo } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/estatisticas', getEstatisticas);
router.get('/relatorio-consumo', getRelatorioConsumo);

export default router;

