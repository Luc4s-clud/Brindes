import { useEffect, useState } from 'react';
import { brindesService, Brinde } from '../services/brindes.service';
import './Brindes.css';

function Brindes() {
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brinde | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    quantidade: 0,
    valorUnitario: '',
    fornecedor: '',
  });

  useEffect(() => {
    loadBrindes();
  }, [search, categoria]);

  const loadBrindes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (categoria) params.categoria = categoria;
      
      const data = await brindesService.getAll(params);
      setBrindes(data);
    } catch (error) {
      console.error('Erro ao carregar brindes:', error);
      alert('Erro ao carregar brindes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        valorUnitario: formData.valorUnitario ? parseFloat(formData.valorUnitario) : undefined,
        quantidade: parseInt(formData.quantidade.toString()) || 0,
        ativo: true,
      };

      if (editing) {
        await brindesService.update(editing.id, data);
      } else {
        await brindesService.create(data);
      }

      resetForm();
      loadBrindes();
      alert(editing ? 'Brinde atualizado com sucesso!' : 'Brinde criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar brinde:', error);
      alert(error.response?.data?.error || 'Erro ao salvar brinde');
    }
  };

  const handleEdit = (brinde: Brinde) => {
    setEditing(brinde);
    setFormData({
      nome: brinde.nome,
      descricao: brinde.descricao || '',
      categoria: brinde.categoria || '',
      quantidade: brinde.quantidade,
      valorUnitario: brinde.valorUnitario?.toString() || '',
      fornecedor: brinde.fornecedor || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este brinde?')) return;

    try {
      await brindesService.delete(id);
      loadBrindes();
      alert('Brinde excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir brinde:', error);
      alert(error.response?.data?.error || 'Erro ao excluir brinde');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      quantidade: 0,
      valorUnitario: '',
      fornecedor: '',
    });
    setEditing(null);
    setShowForm(false);
  };

  const categorias = Array.from(new Set(brindes.map(b => b.categoria).filter(Boolean)));

  return (
    <div className="brindes-page">
      <div className="page-header">
        <h1>Gerenciar Brindes</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Novo Brinde
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Brinde' : 'Novo Brinde'}</h2>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    list="categorias-list"
                  />
                  <datalist id="categorias-list">
                    {categorias.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorUnitario}
                    onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Fornecedor</label>
                  <input
                    type="text"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  />
                </div>
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

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar brindes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : brindes.length === 0 ? (
        <div className="empty-state">Nenhum brinde encontrado</div>
      ) : (
        <div className="brindes-grid">
          {brindes.map((brinde) => (
            <div key={brinde.id} className="brinde-card">
              <div className="brinde-header">
                <h3>{brinde.nome}</h3>
                {brinde.categoria && (
                  <span className="categoria-badge">{brinde.categoria}</span>
                )}
              </div>
              
              {brinde.descricao && (
                <p className="brinde-descricao">{brinde.descricao}</p>
              )}
              
              <div className="brinde-info">
                <div className="info-item">
                  <strong>Estoque:</strong> {brinde.quantidade}
                </div>
                {brinde.valorUnitario && (
                  <div className="info-item">
                    <strong>Valor:</strong> R$ {brinde.valorUnitario.toFixed(2)}
                  </div>
                )}
                {brinde.fornecedor && (
                  <div className="info-item">
                    <strong>Fornecedor:</strong> {brinde.fornecedor}
                  </div>
                )}
              </div>

              <div className="brinde-actions">
                <button className="btn-edit" onClick={() => handleEdit(brinde)}>
                  Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(brinde.id)}>
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

export default Brindes;

