import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar, MenuItem } from './Navbar';

type PerfilUsuario = 'MARKETING' | 'GERENTE' | 'SOLICITANTE' | 'DIRETOR';

const MENU_BASE: Array<MenuItem & { roles: 'all' | PerfilUsuario[] }> = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: 'all' },
  { to: '/solicitar', label: 'Solicitar Brindes', icon: '📝', roles: 'all' },
  { to: '/minhas-solicitacoes', label: 'Minhas Solicitações', icon: '📂', roles: 'all' },
  { to: '/aprovacoes', label: 'Aprovações', icon: '✅', roles: ['GERENTE', 'DIRETOR'], emphasize: true },
  { to: '/brindes', label: 'Estoque', icon: '🎁', roles: ['MARKETING', 'DIRETOR'] },
  { to: '/categorias', label: 'Categorias', icon: '🏷️', roles: ['MARKETING', 'DIRETOR'] },
  { to: '/movimentacoes', label: 'Movimentações', icon: '🔄', roles: ['MARKETING', 'DIRETOR'] },
  { to: '/usuarios', label: 'Usuários', icon: '👥', roles: ['MARKETING', 'DIRETOR'] },
  { to: '/recomendacoes', label: 'Recomendar', icon: '💡', roles: 'all' },
];

export const MainLayout: React.FC = () => {
  const { usuario, logout, isAuthenticated } = useAuth();

  const menuItems = useMemo(() => {
    if (!usuario?.perfil) {
      return MENU_BASE.filter((item) => item.roles === 'all');
    }

    return MENU_BASE.filter((item) => {
      if (item.roles === 'all') return true;
      return item.roles.includes(usuario.perfil as PerfilUsuario);
    });
  }, [usuario?.perfil]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar menuItems={menuItems} usuario={usuario} onLogout={logout} />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;


