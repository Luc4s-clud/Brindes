import api from './api';

export const uploadService = {
  uploadBrindeFoto: async (file: File): Promise<{ fotoUrl: string; filename: string }> => {
    const formData = new FormData();
    formData.append('foto', file);

    const response = await api.post('/upload/brinde', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};


