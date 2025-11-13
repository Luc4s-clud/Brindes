import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  usuariosService,
  UsuarioResumo,
  PerfilUsuario,
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
} from '../services/usuarios.service';
import './Usuarios.css';

type PerfilFiltro = PerfilUsuario | 'TODOS';
type StatusFiltro = boolean | 'TODOS';

interface FormState {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  setor: string;
  ativo: boolean;
}

const perfisOptions: { value: PerfilUsuario; label: string }[] = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'SOLICITANTE', label: 'Solicitante' },
  { value: 'DIRETOR', label: 'Diretor' },
];

const initialFormState: FormState = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'SOLICITANTE',
  setor: '',
  ativo: true,
};

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.error ||
    error?.message ||
    'Não foi possível completar a operação. Tente novamente.'
  );
};

function Usuarios() {
  const { usuario: usuarioLogado } = useAuth();
  const { showSuccess, showError } = useToast();

  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UsuarioResumo | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [filters, setFilters] = useState<{ perfil: PerfilFiltro; ativo: StatusFiltro }>({
    perfil: 'TODOS',
    ativo: true,
  });

  const usuariosFiltrados = useMemo(() => usuarios, [usuarios]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const data = await usuariosService.getAll({
          perfil: filters.perfil,
          ativo: filters.ativo,
        });
        setUsuarios(data);
      } catch (error) {
        console.error('[USUARIOS] Falha ao carregar usuários', error);
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [filters, showError]);

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const handleEdit = (usuario: UsuarioResumo) => {
    setEditing(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      perfil: usuario.perfil,
      setor: usuario.setor || '',
      ativo: usuario.ativo,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.nome.trim()) {
      showError('Informe o nome do usuário.');
      return;
    }

    if (!formData.email.trim()) {
      showError('Informe o email do usuário.');
      return;
    }

    try {
      if (editing) {
        const payload: UpdateUsuarioPayload = {
          nome: formData.nome,
          email: formData.email,
          perfil: formData.perfil,
          setor: formData.setor.trim() ? formData.setor.trim() : null,
          ativo: formData.ativo,
        };

        if (formData.senha.trim()) {
          payload.senha = formData.senha;
        }

        await usuariosService.update(editing.id, payload);
        showSuccess('Usuário atualizado com sucesso!');
      } else {
        if (!formData.senha.trim()) {
          showError('Informe uma senha para o novo usuário.');
          return;
        }

        const payload: CreateUsuarioPayload = {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          perfil: formData.perfil,
          setor: formData.setor.trim() ? formData.setor.trim() : undefined,
        };

        await usuariosService.create(payload);
        showSuccess('Usuário criado com sucesso!');
      }

      handleCloseForm();
      recarregarUsuarios();
    } catch (error) {
      console.error('[USUARIOS] Falha ao salvar usuário', error);
      showError(getErrorMessage(error));
    }
  };

  const recarregarUsuarios = async () => {
    try {
      const data = await usuariosService.getAll({
        perfil: filters.perfil,
        ativo: filters.ativo,
      });
      setUsuarios(data);
    } catch (error) {
      console.error('[USUARIOS] Falha ao recarregar usuários', error);
      showError(getErrorMessage(error));
    }
  };

  const handleDelete = async (usuario: UsuarioResumo) => {
    if (usuarioLogado?.id === usuario.id) {
      showError('Você não pode excluir seu próprio usuário.');
      return;
    }

    const confirmado = window.confirm(
      `Tem certeza que deseja excluir o usuário ${usuario.nome}? Essa ação não poderá ser desfeita.`,
    );

    if (!confirmado) {
      return;
    }

    try {
      await usuariosService.delete(usuario.id);
      showSuccess('Usuário excluído com sucesso!');
      recarregarUsuarios();
    } catch (error) {
      console.error('[USUARIOS] Falha ao excluir usuário', error);
      showError(getErrorMessage(error));
    }
  };

  const handleToggleAtivo = async (usuario: UsuarioResumo) => {
    if (usuarioLogado?.id === usuario.id && usuario.ativo) {
      showError('Você não pode desativar o seu próprio usuário.');
      return;
    }

    try {
      await usuariosService.update(usuario.id, { ativo: !usuario.ativo });
      showSuccess(`Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      recarregarUsuarios();
    } catch (error) {
      console.error('[USUARIOS] Falha ao alterar status do usuário', error);
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1>Gerenciar Usuários</h1>
          <p className="page-subtitle">Administre perfis de acesso e cadastre novos usuários.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          + Novo Usuário
        </button>
      </div>

      <div className="usuarios-filtros">
        <div className="form-group inline">
          <label htmlFor="filtro-perfil">Perfil</label>
          <select
            id="filtro-perfil"
            value={filters.perfil}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                perfil: event.target.value as PerfilFiltro,
              }))
            }
          >
            <option value="TODOS">Todos</option>
            {perfisOptions.map((perfil) => (
              <option key={perfil.value} value={perfil.value}>
                {perfil.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group inline">
          <label htmlFor="filtro-status">Status</label>
          <select
            id="filtro-status"
            value={filters.ativo === 'TODOS' ? 'TODOS' : filters.ativo ? 'ATIVOS' : 'INATIVOS'}
            onChange={(event) => {
              const value = event.target.value;
              setFilters((prev) => ({
                ...prev,
                ativo: value === 'TODOS' ? 'TODOS' : value === 'ATIVOS',
              }));
            }}
          >
            <option value="TODOS">Todos</option>
            <option value="ATIVOS">Ativos</option>
            <option value="INATIVOS">Inativos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando usuários...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="empty-state">
          Nenhum usuário encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Setor</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className={!usuario.ativo ? 'usuario-inativo' : undefined}>
                  <td>
                    <div className="usuario-nome">
                      <span>{usuario.nome}</span>
                      {usuarioLogado?.id === usuario.id && (
                        <span className="badge badge-voce">Você</span>
                      )}
                    </div>
                    {usuario.centroCusto && (
                      <small className="usuario-centro">
                        Centro de custo: {usuario.centroCusto.nome}
                      </small>
                    )}
                  </td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`badge badge-${usuario.perfil.toLowerCase()}`}>
                      {usuario.perfil}
                    </span>
                  </td>
                  <td>{usuario.setor || '—'}</td>
                  <td>
                    <span className={`status-dot ${usuario.ativo ? 'ativo' : 'inativo'}`} />
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </td>
                  <td>{new Date(usuario.updatedAt).toLocaleString('pt-BR')}</td>
                  <td>
                    <div className="acao-botoes">
                      <button className="btn-edit" onClick={() => handleEdit(usuario)}>
                        Editar
                      </button>
                      <button
                        className="btn-status"
                        onClick={() => handleToggleAtivo(usuario)}
                        disabled={usuarioLogado?.id === usuario.id && usuario.ativo}
                      >
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(usuario)}
                        disabled={usuarioLogado?.id === usuario.id}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2>{editing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome *</label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                  disabled={!!editing}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="perfil">Perfil *</label>
                  <select
                    id="perfil"
                    value={formData.perfil}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        perfil: event.target.value as PerfilUsuario,
                      })
                    }
                    required
                  >
                    {perfisOptions.map((perfil) => (
                      <option key={perfil.value} value={perfil.value}>
                        {perfil.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="setor">Setor</label>
                  <input
                    id="setor"
                    type="text"
                    value={formData.setor}
                    onChange={(event) => setFormData({ ...formData, setor: event.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="senha">
                    {editing ? 'Senha (deixe em branco para manter)' : 'Senha *'}
                  </label>
                  <input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(event) => setFormData({ ...formData, senha: event.target.value })}
                    placeholder={editing ? 'Opcional' : 'Obrigatório'}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>Status</label>
                  <div className="checkbox-control">
                    <input
                      id="ativo"
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(event) =>
                        setFormData({ ...formData, ativo: event.target.checked })
                      }
                      disabled={!editing}
                    />
                    <label htmlFor="ativo">
                      {formData.ativo ? 'Usuário ativo' : 'Usuário inativo'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;


