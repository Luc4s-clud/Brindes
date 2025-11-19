import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllBrindes = async (req: Request, res: Response) => {
  try {
    const { categoria, search, ativo, codigo, estoqueBaixo, semEstoque } = req.query;
    
    // Converter para string para garantir comparação correta
    const estoqueBaixoStr = estoqueBaixo === 'true' || estoqueBaixo === true || estoqueBaixo === '1';
    const semEstoqueStr = semEstoque === 'true' || semEstoque === true || semEstoque === '1';
    
    const where: any = {
      ativo: ativo === 'false' ? false : true, // Por padrão mostra apenas ativos
    };
    
    if (categoria) {
      where.categoria = categoria as string;
    }

    if (codigo) {
      where.codigo = codigo as string;
    }
    
    if (search) {
      where.OR = [
        { nome: { contains: search as string } },
        { descricao: { contains: search as string } },
        { codigo: { contains: search as string } },
      ];
    }

    // Filtro para sem estoque (quantidade = 0)
    if (semEstoqueStr) {
      where.quantidade = 0;
    }

    // Para estoque baixo, precisamos buscar todos e filtrar depois
    // pois o Prisma não permite comparar campos diretamente na query
    const brindes = await prisma.brinde.findMany({
      where,
      orderBy: { nome: 'asc' },
    });

    // Filtro para estoque baixo (quantidade <= estoqueMinimo)
    // Inclui também brindes sem estoque que não têm estoqueMinimo definido
    // (mesma lógica do dashboard)
    let filteredBrindes = brindes;
    if (estoqueBaixoStr) {
      filteredBrindes = brindes.filter(brinde => {
        // Brindes com estoqueMinimo definido e quantidade <= estoqueMinimo
        if (brinde.estoqueMinimo !== null && brinde.quantidade <= brinde.estoqueMinimo) {
          return true;
        }
        // Brindes sem estoque (quantidade = 0) e sem estoqueMinimo definido
        if (brinde.quantidade === 0 && brinde.estoqueMinimo === null) {
          return true;
        }
        return false;
      });
    }

    res.json(filteredBrindes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBrindeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brinde = await prisma.brinde.findUnique({
      where: { id: parseInt(id) },
    });

    if (!brinde) {
      return res.status(404).json({ error: 'Brinde não encontrado' });
    }

    res.json(brinde);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBrinde = async (req: Request, res: Response) => {
  try {
    const { 
      nome, 
      codigo,
      descricao, 
      categoria, 
      quantidade, 
      valorUnitario, 
      fornecedor,
      fotoUrl,
      especificacoes,
      validade,
      estoqueMinimo,
      recomendacaoUso,
      ativo
    } = req.body;

    const brinde = await prisma.brinde.create({
      data: {
        nome,
        codigo,
        descricao,
        categoria,
        quantidade: quantidade || 0,
        valorUnitario: valorUnitario ? parseFloat(valorUnitario) : null,
        fornecedor,
        fotoUrl,
        especificacoes,
        validade: validade ? new Date(validade) : null,
        estoqueMinimo: estoqueMinimo ? parseInt(estoqueMinimo) : null,
        recomendacaoUso,
        ativo: ativo !== undefined ? ativo : true,
      },
    });

    res.status(201).json(brinde);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nome ou código já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateBrinde = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      codigo,
      descricao, 
      categoria, 
      quantidade, 
      valorUnitario, 
      fornecedor,
      fotoUrl,
      especificacoes,
      validade,
      estoqueMinimo,
      recomendacaoUso,
      ativo
    } = req.body;

    const data: any = {};

    if (nome) data.nome = nome;
    if (codigo !== undefined) data.codigo = codigo;
    if (descricao !== undefined) data.descricao = descricao;
    if (categoria !== undefined) data.categoria = categoria;
    if (quantidade !== undefined) data.quantidade = parseInt(quantidade);
    if (valorUnitario !== undefined) data.valorUnitario = valorUnitario ? parseFloat(valorUnitario) : null;
    if (fornecedor !== undefined) data.fornecedor = fornecedor;
    if (fotoUrl !== undefined) data.fotoUrl = fotoUrl;
    if (especificacoes !== undefined) data.especificacoes = especificacoes;
    if (validade !== undefined) data.validade = validade ? new Date(validade) : null;
    if (estoqueMinimo !== undefined) data.estoqueMinimo = estoqueMinimo ? parseInt(estoqueMinimo) : null;
    if (recomendacaoUso !== undefined) data.recomendacaoUso = recomendacaoUso;
    if (ativo !== undefined) data.ativo = ativo;

    const brinde = await prisma.brinde.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(brinde);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Brinde não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nome ou código já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteBrinde = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.brinde.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Brinde excluído com sucesso' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Brinde não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

