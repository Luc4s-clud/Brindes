import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { Navbar, MenuItem } from '../Navbar';

const menuItems: MenuItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/usuarios', label: 'Usuários', icon: '👥', emphasize: true },
];

describe('Navbar', () => {
  it('renderiza itens de navegação e usuário', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar
          menuItems={menuItems}
          usuario={{
            id: 1,
            nome: 'João da Silva',
            email: 'joao@empresa.com',
            perfil: 'MARKETING',
          }}
          onLogout={() => undefined}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ir para o dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('João da Silva')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });
});


