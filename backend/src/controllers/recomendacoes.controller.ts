import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { StatusRecomendacao } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllRecomendacoes = async (req: Request, res: Response) => {
  try {
    const { status, categoria } = req.query;
    
    const where: any = {};
    
    if (status) {
      where.status = status as StatusRecomendacao;
    }
    
    if (categoria) {
      where.categoria = categoria as string;
    }

    const recomendacoes = await prisma.recomendacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(recomendacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecomendacaoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recomendacao = await prisma.recomendacao.findUnique({
      where: { id: parseInt(id) },
    });

    if (!recomendacao) {
      return res.status(404).json({ error: 'Recomendação não encontrada' });
    }

    res.json(recomendacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createRecomendacao = async (req: Request, res: Response) => {
  try {
    const { nome, descricao, imagemUrl, link, categoria, sugeridoPor, email } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const recomendacao = await prisma.recomendacao.create({
      data: {
        nome,
        descricao,
        imagemUrl,
        link,
        categoria,
        sugeridoPor,
        email,
        status: StatusRecomendacao.PENDENTE,
      },
    });

    res.status(201).json(recomendacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRecomendacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, imagemUrl, link, categoria, status, observacao } = req.body;
    const userId = req.userId;

    const recomendacao = await prisma.recomendacao.findUnique({
      where: { id: parseInt(id) },
    });

    if (!recomendacao) {
      return res.status(404).json({ error: 'Recomendação não encontrada' });
    }

    const data: any = {};

    if (nome) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (imagemUrl !== undefined) data.imagemUrl = imagemUrl;
    if (link !== undefined) data.link = link;
    if (categoria !== undefined) data.categoria = categoria;
    if (observacao !== undefined) data.observacao = observacao;

    // Apenas Marketing pode aprovar/rejeitar
    if (status && (req.userPerfil === 'MARKETING' || req.userPerfil === 'DIRETOR')) {
      data.status = status as StatusRecomendacao;
      data.aprovadoPor = userId;
    }

    const recomendacaoAtualizada = await prisma.recomendacao.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(recomendacaoAtualizada);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Recomendação não encontrada' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteRecomendacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Apenas Marketing pode excluir
    if (req.userPerfil !== 'MARKETING' && req.userPerfil !== 'DIRETOR') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.recomendacao.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Recomendação excluída com sucesso' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Recomendação não encontrada' });
    }
    res.status(500).json({ error: error.message });
  }
};

