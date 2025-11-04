import { Request, Response } from 'express';
import path from 'path';

export const uploadBrindeFoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Retornar URL relativa da imagem
    const fotoUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Foto enviada com sucesso',
      fotoUrl: fotoUrl,
      filename: req.file.filename,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadRecomendacaoImagem = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const imagemUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Imagem enviada com sucesso',
      imagemUrl: imagemUrl,
      filename: req.file.filename,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

