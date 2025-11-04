import { Router } from 'express';
import {
  getAllMovimentacoes,
  getMovimentacoesByBrinde,
  createMovimentacao,
} from '../controllers/movimentacoes.controller';

const router = Router();

router.get('/', getAllMovimentacoes);
router.get('/brinde/:brindeId', getMovimentacoesByBrinde);
router.post('/', createMovimentacao);

export default router;

