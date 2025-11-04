import { Router } from 'express';
import { uploadBrindeFoto, uploadRecomendacaoImagem } from '../controllers/upload.controller';
import { uploadBrindeFoto as uploadMiddlewareBrinde, uploadRecomendacaoImagem as uploadMiddlewareRecomendacao } from '../middleware/upload.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Upload de foto de brinde (apenas Marketing)
router.post('/brinde', authenticate, authorize('MARKETING', 'DIRETOR'), uploadMiddlewareBrinde, uploadBrindeFoto);

// Upload de imagem de recomendação (público - qualquer um pode sugerir)
router.post('/recomendacao', uploadMiddlewareRecomendacao, uploadRecomendacaoImagem);

export default router;

