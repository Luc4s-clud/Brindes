import { NavLink } from 'react-router-dom';
import type { Usuario } from '../../services/auth.service';

export interface MenuItem {
  to: string;
  label: string;
  icon?: string;
  emphasize?: boolean;
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

const defaultActiveClass = (isActive: boolean, emphasize?: boolean) =>
  `nav-link ${isActive ? 'active' : ''} ${emphasize ? 'emphasize' : ''}`;

export const Navbar: React.FC<NavbarProps> = ({
  menuItems,
  usuario,
  onLogout,
  getActiveClass = defaultActiveClass,
}) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <NavLink to="/" className="nav-logo" aria-label="Ir para o dashboard">
            <span className="nav-logo-icon">🎁</span>
            <span>
              <span className="nav-logo-title">Sistema de Brindes</span>
            </span>
          </NavLink>
        </div>

        <div className="nav-center">
          <ul className="nav-menu" role="menubar">
            {menuItems.map((item) => (
              <li key={item.to} className="nav-item" role="none">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => getActiveClass(isActive, item.emphasize)}
                  end={item.to === '/'}
                  role="menuitem"
                  aria-label={item.label}
                >
                  <span className="nav-link-content">
                    {item.icon && (
                      <span className="nav-link-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="nav-link-text">{item.label}</span>
                  </span>
                  <span className="nav-link-indicator" aria-hidden="true" />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-user-avatar" aria-hidden="true">
              {obterIniciais(usuario?.nome)}
            </div>
            <div className="nav-user-info">
              <span className="nav-user-name">{usuario?.nome || 'Usuário'}</span>
              <span className="nav-user-role">{obterPerfilLabel(usuario?.perfil)}</span>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout" type="button">
            <span className="btn-logout-icon" aria-hidden="true">
              ⎋
            </span>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


