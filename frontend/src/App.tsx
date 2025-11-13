import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Brindes from './pages/Brindes';
import Categorias from './pages/Categorias';
import Movimentacoes from './pages/Movimentacoes';
import SolicitarBrindes from './pages/SolicitarBrindes';
import MinhasSolicitacoes from './pages/MinhasSolicitacoes';
import Aprovacoes from './pages/Aprovacoes';
import Dashboard from './pages/Dashboard';
import Recomendacoes from './pages/Recomendacoes';
import Usuarios from './pages/Usuarios';
import { queryClient } from './lib/queryClient';
import './App.css';

const AppShell: React.FC = () => (
  <div className="app">
    <Outlet />
  </div>
);

const ProtectedLayout: React.FC = () => (
  <ProtectedRoute>
    <MainLayout />
  </ProtectedRoute>
);

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />
                <Route element={<ProtectedLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="solicitar" element={<SolicitarBrindes />} />
                  <Route path="minhas-solicitacoes" element={<MinhasSolicitacoes />} />
                  <Route
                    path="aprovacoes"
                    element={
                      <ProtectedRoute requiredPerfil={['GERENTE', 'DIRETOR']}>
                        <Aprovacoes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="brindes"
                    element={
                      <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                        <Brindes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="categorias"
                    element={
                      <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                        <Categorias />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="movimentacoes"
                    element={
                      <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                        <Movimentacoes />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="recomendacoes" element={<Recomendacoes />} />
                  <Route
                    path="usuarios"
                    element={
                      <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                        <Usuarios />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Route>
            </Routes>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;

