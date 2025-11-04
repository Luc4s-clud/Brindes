import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(categorias);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoriaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(categoria);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nome, descricao } = req.body;

    const categoria = await prisma.categoria.create({
      data: { nome, descricao },
    });

    res.status(201).json(categoria);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Categoria já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nome, descricao },
    });

    res.json(categoria);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Categoria já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.categoria.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.status(500).json({ error: error.message });
  }
};

