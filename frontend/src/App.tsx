import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import './App.css';

function AppContent() {
  const { isAuthenticated, usuario, logout } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🎁 Sistema de Brindes
            </Link>
            <ul className="nav-menu">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/solicitar">Solicitar Brindes</Link></li>
              <li><Link to="/minhas-solicitacoes">Minhas Solicitações</Link></li>
              {(usuario?.perfil === 'GERENTE' || usuario?.perfil === 'DIRETOR') && (
                <li><Link to="/aprovacoes">Aprovações</Link></li>
              )}
              {(usuario?.perfil === 'MARKETING' || usuario?.perfil === 'DIRETOR') && (
                <>
                  <li><Link to="/brindes">Estoque</Link></li>
                  <li><Link to="/categorias">Categorias</Link></li>
                  <li><Link to="/movimentacoes">Movimentações</Link></li>
                </>
              )}
              <li><Link to="/recomendacoes">Recomendar</Link></li>
              <li>
                <button onClick={logout} className="btn-logout">
                  Sair
                </button>
              </li>
            </ul>
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
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

