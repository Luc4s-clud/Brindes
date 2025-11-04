import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, Usuario } from '../services/auth.service';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenStorage = authService.getToken();
    const usuarioStorage = authService.getUsuario();

    if (tokenStorage && usuarioStorage) {
      setToken(tokenStorage);
      setUsuario(usuarioStorage);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await authService.login(email, senha);
    setToken(response.token);
    setUsuario(response.usuario);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

