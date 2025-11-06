// Função centralizada para obter URLs de imagens
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // Se já é uma URL completa, retorna como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Em produção, usa a variável de ambiente ou assume que as imagens estão no mesmo servidor
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  // Se API_URL está definida, usa ela (sem /api no final se já existir)
  if (API_URL) {
    const baseUrl = API_URL.replace(/\/api\/?$/, '');
    return `${baseUrl}${cleanPath}`;
  }
  
  // Em desenvolvimento, usa o proxy local (sem /api porque as imagens não estão em /api)
  // Ajuste conforme sua configuração de servidor
  return cleanPath;
};

