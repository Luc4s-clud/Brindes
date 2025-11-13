import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { PerfilUsuario } from '@prisma/client';

const JWT_SECRET: string = process.env.JWT_SECRET || 'seu_secret_jwt_aqui';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    console.log('[AUTH] Tentativa de login recebida', {
      email,
      origin: req.headers.origin,
      host: req.headers.host,
      ip: req.ip,
    });

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário (Prisma conecta automaticamente)
    let usuario;
    try {
      usuario = await prisma.usuario.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error('❌ Erro de conexão com banco de dados:', dbError.message);
      console.error('Stack:', dbError.stack);
      return res.status(500).json({ 
        error: 'Erro de conexão com o banco de dados',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    console.log('[AUTH] Resultado da busca de usuário', {
      email,
      encontrado: !!usuario,
      ativo: usuario?.ativo,
    });

    if (!usuario) {
      console.warn('[AUTH] Credenciais inválidas - usuário não encontrado', { email });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!usuario.ativo) {
      console.warn('[AUTH] Usuário inativo tentou login', { email });
      return res.status(403).json({ error: 'Usuário inativo' });
    }

    // Verificar se a senha está hasheada
    if (!usuario.senha || !usuario.senha.startsWith('$2')) {
      console.error('⚠️ Senha do usuário não está hasheada corretamente');
      return res.status(500).json({ 
        error: 'Erro de configuração: senha inválida',
        details: process.env.NODE_ENV === 'development' ? 'Senha não está hasheada' : undefined
      });
    }

    let senhaValida = false;
    try {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } catch (bcryptError: any) {
      console.error('❌ Erro ao comparar senha:', bcryptError.message);
      return res.status(500).json({ 
        error: 'Erro ao validar senha',
        details: process.env.NODE_ENV === 'development' ? bcryptError.message : undefined
      });
    }

    if (!senhaValida) {
      console.warn('[AUTH] Credenciais inválidas - senha incorreta', { email });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    let token: string;
    try {
      token = jwt.sign(
        { userId: usuario.id, perfil: usuario.perfil },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );
    } catch (jwtError: any) {
      console.error('❌ Erro ao gerar token JWT:', jwtError.message);
      return res.status(500).json({ 
        error: 'Erro ao gerar token de autenticação',
        details: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        setor: usuario.setor,
      },
    });

    console.log('[AUTH] Login concluído com sucesso', {
      userId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, perfil, setor } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ error: 'Nome, email, senha e perfil são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: perfil as PerfilUsuario,
        setor,
      },
    });

    // Gerar token
    const token = jwt.sign(
      { userId: usuario.id, perfil: usuario.perfil },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        setor: usuario.setor,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        centroCusto: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      setor: usuario.setor,
      centroCusto: usuario.centroCusto,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

