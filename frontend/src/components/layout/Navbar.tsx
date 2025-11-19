import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, matchPath, useLocation } from 'react-router-dom';
import type { Usuario } from '../../services/auth.service';

export interface MenuItem {
  id: string;
  label: string;
  to?: string;
  icon?: string;
  emphasize?: boolean;
  children?: MenuItem[];
}

interface NavbarProps {
  menuItems: MenuItem[];
  usuario: Usuario | null;
  onLogout: () => void;
  getActiveClass?: (isActive: boolean, emphasize?: boolean) => string;
}

const perfilLabels: Record<string, string> = {
  MARKETING: 'Marketing',
  GERENTE: 'Gestor',
  SOLICITANTE: 'Solicitante',
  DIRETOR: 'Diretoria',
};

const obterPerfilLabel = (perfil?: string | null) => {
  if (!perfil) return 'Perfil não definido';
  return perfilLabels[perfil] ?? perfil;
};

const obterIniciais = (nome?: string | null) => {
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

export const Navbar: React.FC<NavbarProps> = ({
  menuItems,
  usuario,
  onLogout,
}) => {
  const location = useLocation();
  const { pathname } = location;
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isItemActive = useCallback(
    (item: MenuItem): boolean => {
      const isCurrentPath = item.to
        ? Boolean(matchPath({ path: item.to, end: item.to === '/' }, pathname))
        : false;

      if (isCurrentPath) {
        return true;
      }

      if (item.children?.length) {
        return item.children.some((child) => isItemActive(child));
      }

      return false;
    },
    [pathname],
  );

  const handleMouseEnter = useCallback((id: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenItemId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenItemId(null);
    }, 150);
  }, []);

  const handleToggle = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenItemId((current) => (current === id ? null : id));
  }, []);

  useEffect(() => {
    setOpenItemId(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <NavLink to="/" className="nav-logo" aria-label="Ir para o dashboard">
            <span className="nav-logo-icon">🎁</span>
            <span className="nav-logo-title">Sistema de Brindes</span>
          </NavLink>
        </div>

        <div className="nav-center">
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isActive = isItemActive(item);
              const isExpanded = openItemId === item.id;

              if (hasChildren) {
                return (
                  <li
                    key={item.id}
                    className={`nav-item dropdown ${isExpanded ? 'open' : ''} ${isActive ? 'active' : ''}`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      className="nav-link"
                      onClick={(e) => handleToggle(item.id, e)}
                      aria-expanded={isExpanded}
                      aria-haspopup="true"
                    >
                      {item.icon && <span className="nav-icon">{item.icon}</span>}
                      <span className="nav-text">{item.label}</span>
                      <span className="nav-arrow">▼</span>
                    </button>
                    <ul className="dropdown-menu">
                      {item.children?.map((child) => {
                        const childActive = child.to
                          ? Boolean(matchPath({ path: child.to, end: child.to === '/' }, pathname))
                          : false;
                        return (
                          <li key={child.id} className="dropdown-item">
                            <NavLink
                              to={child.to ?? '#'}
                              className={`dropdown-link ${childActive ? 'active' : ''}`}
                              onClick={() => setOpenItemId(null)}
                            >
                              {child.icon && <span className="nav-icon">{child.icon}</span>}
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }

              return (
                <li key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <NavLink to={item.to ?? '#'} className="nav-link" end={item.to === '/'}>
                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                    <span className="nav-text">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-user-avatar">{obterIniciais(usuario?.nome)}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{usuario?.nome || 'Usuário'}</span>
              <span className="nav-user-role">{obterPerfilLabel(usuario?.perfil)}</span>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout" type="button" aria-label="Sair">
            <span className="btn-logout-icon">⎋</span>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


