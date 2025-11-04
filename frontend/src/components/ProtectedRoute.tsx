import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPerfil?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPerfil }) => {
  const { isAuthenticated, usuario, loading } = useAuth();

  if (loading) {
    return <div className="loading-fullscreen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPerfil && usuario && !requiredPerfil.includes(usuario.perfil)) {
    return (
      <div className="error-container">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return <>{children}</>;
};

