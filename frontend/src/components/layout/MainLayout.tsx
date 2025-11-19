import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar, MenuItem } from './Navbar';

type PerfilUsuario = 'MARKETING' | 'GERENTE' | 'SOLICITANTE' | 'DIRETOR';

type MenuItemWithRoles = MenuItem & {
  roles: 'all' | PerfilUsuario[];
  children?: MenuItemWithRoles[];
};

const MENU_BASE: MenuItemWithRoles[] = [
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: '📊',
    roles: 'all',
    children: [
      { id: 'dashboard', to: '/', label: 'Dashboard', icon: '📊', roles: 'all' },
    ],
  },
  {
    id: 'solicitacoes',
    label: 'Solicitações',
    icon: '📝',
    roles: 'all',
    children: [
      { id: 'solicitar', to: '/solicitar', label: 'Solicitar Brindes', icon: '📝', roles: 'all' },
      {
        id: 'minhas-solicitacoes',
        to: '/minhas-solicitacoes',
        label: 'Minhas Solicitações',
        icon: '📂',
        roles: 'all',
      },
      {
        id: 'aprovacoes',
        to: '/aprovacoes',
        label: 'Aprovações',
        icon: '✅',
        roles: ['GERENTE', 'DIRETOR'],
        emphasize: true,
      },
    ],
  },
  {
    id: 'gestao-estoque',
    label: 'Gestão de Estoque',
    icon: '🎯',
    roles: ['MARKETING', 'DIRETOR'],
    children: [
      { id: 'brindes', to: '/brindes', label: 'Estoque', icon: '🎁', roles: ['MARKETING', 'DIRETOR'] },
      { id: 'categorias', to: '/categorias', label: 'Categorias', icon: '🏷️', roles: ['MARKETING', 'DIRETOR'] },
      {
        id: 'movimentacoes',
        to: '/movimentacoes',
        label: 'Movimentações',
        icon: '🔄',
        roles: ['MARKETING', 'DIRETOR'],
      },
    ],
  },
  {
    id: 'administracao',
    label: 'Administração',
    icon: '🛠️',
    roles: ['MARKETING', 'DIRETOR'],
    children: [
      { id: 'usuarios', to: '/usuarios', label: 'Usuários', icon: '👥', roles: ['MARKETING', 'DIRETOR'] },
    ],
  },
  {
    id: 'engajamento',
    label: 'Engajamento',
    icon: '💡',
    roles: 'all',
    children: [
      { id: 'recomendacoes', to: '/recomendacoes', label: 'Recomendar', icon: '💡', roles: 'all' },
    ],
  },
];

export const MainLayout: React.FC = () => {
  const { usuario, logout, isAuthenticated } = useAuth();

  const menuItems = useMemo(() => {
    const perfil = usuario?.perfil as PerfilUsuario | undefined;

    const perfilTemAcesso = (roles: 'all' | PerfilUsuario[]) => {
      if (roles === 'all') {
        return true;
      }

      if (!perfil) {
        return false;
      }

      return roles.includes(perfil);
    };

    const filtrarMenu = (items: MenuItemWithRoles[]): MenuItem[] =>
      items
        .map((item) => {
          const { roles, children, ...rest } = item;

          if (!perfilTemAcesso(roles)) {
            return null;
          }

          if (children?.length) {
            const childrenFiltrados = filtrarMenu(children);

            if (childrenFiltrados.length === 0) {
              return null;
            }

            return {
              ...rest,
              children: childrenFiltrados,
            };
          }

          return {
            ...rest,
          };
        })
        .filter((item): item is MenuItem => item !== null);

    return filtrarMenu(MENU_BASE);
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


