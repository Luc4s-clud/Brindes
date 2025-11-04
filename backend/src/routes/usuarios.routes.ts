import { Router } from 'express';
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuarios.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Apenas Marketing pode gerenciar usuários
router.get('/', authorize('MARKETING', 'DIRETOR'), getAllUsuarios);
router.get('/:id', authorize('MARKETING', 'DIRETOR'), getUsuarioById);
router.post('/', authorize('MARKETING', 'DIRETOR'), createUsuario);
router.put('/:id', authorize('MARKETING', 'DIRETOR'), updateUsuario);
router.delete('/:id', authorize('MARKETING', 'DIRETOR'), deleteUsuario);

export default router;

