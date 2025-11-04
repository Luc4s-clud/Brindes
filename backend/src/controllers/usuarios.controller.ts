import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { PerfilUsuario } from '@prisma/client';

export const getAllUsuarios = async (req: Request, res: Response) => {
  try {
    const { perfil, ativo } = req.query;
    
    const where: any = {};
    
    if (perfil) {
      where.perfil = perfil as PerfilUsuario;
    }
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      include: {
        centroCusto: true,
      },
      orderBy: { nome: 'asc' },
    });

    // Remover senha dos resultados
    const usuariosSemSenha = usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      setor: u.setor,
      ativo: u.ativo,
      centroCusto: u.centroCusto,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.json(usuariosSemSenha);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        centroCusto: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Remover senha
    const { senha, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
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

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: perfil as PerfilUsuario,
        setor,
      },
      include: {
        centroCusto: true,
      },
    });

    // Remover senha
    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, perfil, setor, ativo } = req.body;

    const data: any = {};

    if (nome) data.nome = nome;
    if (email) data.email = email;
    if (perfil) data.perfil = perfil as PerfilUsuario;
    if (setor !== undefined) data.setor = setor;
    if (ativo !== undefined) data.ativo = ativo;

    // Se senha foi fornecida, fazer hash
    if (senha) {
      data.senha = await bcrypt.hash(senha, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data,
      include: {
        centroCusto: true,
      },
    });

    // Remover senha
    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

