import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userPerfil?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const secret = process.env.JWT_SECRET || 'seu_secret_jwt_aqui';
    const decoded = jwt.verify(token, secret) as { userId: number; perfil: string };

    req.userId = decoded.userId;
    req.userPerfil = decoded.perfil;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const authorize = (...perfis: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userPerfil) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!perfis.includes(req.userPerfil)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
};

