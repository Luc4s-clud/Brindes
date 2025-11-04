import { Router } from 'express';
import {
  getAllBrindes,
  getBrindeById,
  createBrinde,
  updateBrinde,
  deleteBrinde,
} from '../controllers/brindes.controller';
import { validateBrinde } from '../middleware/validation.middleware';

const router = Router();

router.get('/', getAllBrindes);
router.get('/:id', getBrindeById);
router.post('/', validateBrinde, createBrinde);
router.put('/:id', validateBrinde, updateBrinde);
router.delete('/:id', deleteBrinde);

export default router;

