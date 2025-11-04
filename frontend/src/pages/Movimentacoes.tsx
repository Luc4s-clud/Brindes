import { useEffect, useState } from 'react';
import { movimentacoesService, Movimentacao } from '../services/movimentacoes.service';
import { brindesService, Brinde } from '../services/brindes.service';
import './Movimentacoes.css';

function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brindeId: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: 0,
    motivo: '',
    observacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movData, brindesData] = await Promise.all([
        movimentacoesService.getAll(),
        brindesService.getAll(),
      ]);
      setMovimentacoes(movData);
      setBrindes(brindesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movimentacoesService.create({
        brindeId: parseInt(formData.brindeId),
        tipo: formData.tipo,
        quantidade: formData.quantidade,
        motivo: formData.motivo || undefined,
        observacao: formData.observacao || undefined,
      });

      resetForm();
      loadData();
      alert('Movimentação registrada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar movimentação:', error);
      alert(error.response?.data?.error || 'Erro ao salvar movimentação');
    }
  };

  const resetForm = () => {
    setFormData({
      brindeId: '',
      tipo: 'entrada',
      quantidade: 0,
      motivo: '',
      observacao: '',
    });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="movimentacoes-page">
      <div className="page-header">
        <h1>Movimentações de Estoque</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nova Movimentação
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Movimentação</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Brinde *</label>
                <select
                  value={formData.brindeId}
                  onChange={(e) => setFormData({ ...formData, brindeId: e.target.value })}
                  required
                >
                  <option value="">Selecione um brinde</option>
                  {brindes.map((brinde) => (
                    <option key={brinde.id} value={brinde.id}>
                      {brinde.nome} (Estoque: {brinde.quantidade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'entrada' | 'saida' })}
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Motivo</label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ex: Compra, Venda, Ajuste, etc."
                />
              </div>

              <div className="form-group">
                <label>Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : movimentacoes.length === 0 ? (
        <div className="empty-state">Nenhuma movimentação encontrada</div>
      ) : (
        <div className="movimentacoes-table">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Brinde</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Motivo</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((mov) => (
                <tr key={mov.id}>
                  <td>{formatDate(mov.createdAt)}</td>
                  <td>{mov.brinde.nome}</td>
                  <td>
                    <span className={`tipo-badge ${mov.tipo}`}>
                      {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>{mov.quantidade}</td>
                  <td>{mov.motivo || '-'}</td>
                  <td>{mov.observacao || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Movimentacoes;

