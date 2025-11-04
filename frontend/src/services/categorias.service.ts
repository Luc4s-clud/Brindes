import api from './api';

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
}

export const categoriasService = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await api.get('/categorias');
    return response.data;
  },

  getById: async (id: number): Promise<Categoria> => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  create: async (data: Omit<Categoria, 'id' | 'createdAt' | 'updatedAt'>): Promise<Categoria> => {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.put(`/categorias/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};

