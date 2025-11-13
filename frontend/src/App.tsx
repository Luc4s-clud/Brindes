import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import './App.css';

type PerfilUsuario = 'MARKETING' | 'GERENTE' | 'SOLICITANTE' | 'DIRETOR';

const perfilLabels: Record<PerfilUsuario, string> = {
  MARKETING: 'Marketing',
  GERENTE: 'Gestor',
  SOLICITANTE: 'Solicitante',
  DIRETOR: 'Diretoria',
};

const obterPerfilLabel = (perfil?: string | null) => {
  if (!perfil) return 'Perfil não informado';
  return perfilLabels[perfil as PerfilUsuario] ?? perfil;
};

const obterInicialNome = (nome?: string | null) => {
  if (!nome) return '??';
  const partes = nome
    .trim()
    .split(' ')
    .filter(Boolean);

  if (partes.length === 0) return '??';

  const primeira = partes[0][0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] ?? '' : partes[0][1] ?? '';

  return `${primeira}${ultima}`.toUpperCase();
};

type MenuItem = {
  to: string;
  label: string;
  roles: 'all' | PerfilUsuario[];
  emphasize?: boolean;
};

function AppContent() {
  const { isAuthenticated, usuario, logout } = useAuth();

  const menuItems: MenuItem[] = [
    { to: '/', label: 'Dashboard', roles: 'all' },
    { to: '/solicitar', label: 'Solicitar Brindes', roles: 'all' },
    { to: '/minhas-solicitacoes', label: 'Minhas Solicitações', roles: 'all' },
    { to: '/aprovacoes', label: 'Aprovações', roles: ['GERENTE', 'DIRETOR'], emphasize: true },
    { to: '/brindes', label: 'Estoque', roles: ['MARKETING', 'DIRETOR'] },
    { to: '/categorias', label: 'Categorias', roles: ['MARKETING', 'DIRETOR'] },
    { to: '/movimentacoes', label: 'Movimentações', roles: ['MARKETING', 'DIRETOR'] },
    { to: '/usuarios', label: 'Usuários', roles: ['MARKETING', 'DIRETOR'] },
    { to: '/recomendacoes', label: 'Recomendar', roles: 'all' },
  ];

  const menuVisivel = menuItems.filter((item) => {
    if (item.roles === 'all') return true;
    if (!usuario?.perfil) return false;
    return item.roles.includes(usuario.perfil as PerfilUsuario);
  });

  const usuarioInicial = obterInicialNome(usuario?.nome);
  const perfilLabel = obterPerfilLabel(usuario?.perfil);

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-left">
              <Link to="/" className="nav-logo" aria-label="Ir para o dashboard">
                <span className="nav-logo-icon">🎁</span>
                <span>
                  <span className="nav-logo-title">Sistema de Brindes</span>
                  <span className="nav-logo-subtitle">Portal corporativo</span>
                </span>
              </Link>
              <span className="nav-tagline">Controle total de estoques, solicitações e aprovações.</span>
            </div>

            <div className="nav-center">
              <ul className="nav-menu">
                {menuVisivel.map((item) => (
                  <li key={item.to} className="nav-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''} ${item.emphasize ? 'emphasize' : ''}`
                      }
                      end={item.to === '/'}
                    >
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="nav-right">
              <div className="nav-user">
                <div className="nav-user-avatar" aria-hidden="true">
                  {usuarioInicial}
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{usuario?.nome || 'Usuário'}</span>
                  <span className="nav-user-role">{perfilLabel}</span>
                </div>
              </div>
              <button onClick={logout} className="btn-logout" type="button">
                Sair
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className={isAuthenticated ? 'main-content' : 'main-content-full'}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitar"
            element={
              <ProtectedRoute>
                <SolicitarBrindes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minhas-solicitacoes"
            element={
              <ProtectedRoute>
                <MinhasSolicitacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aprovacoes"
            element={
              <ProtectedRoute requiredPerfil={['GERENTE', 'DIRETOR']}>
                <Aprovacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brindes"
            element={
              <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                <Brindes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                <Categorias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movimentacoes"
            element={
              <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                <Movimentacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recomendacoes"
            element={<Recomendacoes />}
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requiredPerfil={['MARKETING', 'DIRETOR']}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;

