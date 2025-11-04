import { useEffect, useState } from 'react';
import { categoriasService, Categoria } from '../services/categorias.service';
import './Categorias.css';

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoriasService.update(editing.id, formData);
      } else {
        await categoriasService.create(formData);
      }

      resetForm();
      loadCategorias();
      alert(editing ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      alert(error.response?.data?.error || 'Erro ao salvar categoria');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditing(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await categoriasService.delete(id);
      loadCategorias();
      alert('Categoria excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      alert(error.response?.data?.error || 'Erro ao excluir categoria');
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', descricao: '' });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="categorias-page">
      <div className="page-header">
        <h1>Gerenciar Categorias</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : categorias.length === 0 ? (
        <div className="empty-state">Nenhuma categoria encontrada</div>
      ) : (
        <div className="categorias-list">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="categoria-card">
              <div className="categoria-content">
                <h3>{categoria.nome}</h3>
                {categoria.descricao && (
                  <p className="categoria-descricao">{categoria.descricao}</p>
                )}
              </div>
              <div className="categoria-actions">
                <button className="btn-edit" onClick={() => handleEdit(categoria)}>
                  Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(categoria.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categorias;

