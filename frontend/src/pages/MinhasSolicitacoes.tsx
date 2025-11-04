import { useEffect, useState } from 'react';
import { solicitacoesService, Solicitacao } from '../services/solicitacoes.service';
import { useAuth } from '../contexts/AuthContext';
import './MinhasSolicitacoes.css';

function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    loadSolicitacoes();
  }, [filtroStatus]);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroStatus) params.status = filtroStatus;
      if (usuario?.id) params.solicitanteId = usuario.id;
      const data = await solicitacoesService.getAll(params);
      setSolicitacoes(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      alert('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDENTE: { label: 'Pendente', className: 'status-pendente' },
      APROVADA: { label: 'Aprovada', className: 'status-aprovada' },
      REJEITADA: { label: 'Rejeitada', className: 'status-rejeitada' },
      ENTREGUE: { label: 'Entregue', className: 'status-entregue' },
      CANCELADA: { label: 'Cancelada', className: 'status-cancelada' },
    };
    const config = statusConfig[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) return;

    try {
      await solicitacoesService.cancelar(id);
      loadSolicitacoes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar solicitação');
    }
  };

  return (
    <div className="minhas-solicitacoes">
      <h1>Minhas Solicitações</h1>

      <div className="filters">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos os status</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="APROVADA">Aprovadas</option>
          <option value="REJEITADA">Rejeitadas</option>
          <option value="ENTREGUE">Entregues</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : solicitacoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div className="solicitacoes-list">
          {solicitacoes.map((solicitacao) => (
            <div key={solicitacao.id} className="solicitacao-card">
              <div className="solicitacao-header">
                <div>
                  <h3>Solicitação #{solicitacao.numeroSolicitacao}</h3>
                  <p className="solicitacao-meta">
                    Criada em {formatarData(solicitacao.createdAt)}
                  </p>
                </div>
                {getStatusBadge(solicitacao.status)}
              </div>

              <div className="solicitacao-info">
                <div className="info-row">
                  <span><strong>Centro de Custo:</strong> {solicitacao.centroCusto?.nome}</span>
                  {solicitacao.finalidade && (
                    <span><strong>Finalidade:</strong> {solicitacao.finalidade}</span>
                  )}
                </div>
                {solicitacao.justificativa && (
                  <p><strong>Justificativa:</strong> {solicitacao.justificativa}</p>
                )}
                {solicitacao.valorTotal && (
                  <p className="valor-total">
                    <strong>Valor Total:</strong> R$ {solicitacao.valorTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>

              {solicitacao.itens && solicitacao.itens.length > 0 && (
                <div className="itens-lista">
                  <h4>Itens:</h4>
                  <ul>
                    {solicitacao.itens.map((item, idx) => (
                      <li key={idx}>
                        {item.brinde?.nome} - Qtd: {item.quantidade}
                        {item.valorUnitario && (
                          <span className="item-valor">
                            {' '}(R$ {(item.valorUnitario * item.quantidade).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {solicitacao.aprovacoes && solicitacao.aprovacoes.length > 0 && (
                <div className="aprovacoes-lista">
                  <h4>Aprovações:</h4>
                  <ul>
                    {solicitacao.aprovacoes.map((aprovacao, idx) => (
                      <li key={idx}>
                        {aprovacao.aprovadoPor?.nome} - {aprovacao.status === 'APROVADA' ? '✓ Aprovado' : '✗ Rejeitado'}
                        {aprovacao.observacao && ` - ${aprovacao.observacao}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {solicitacao.status === 'PENDENTE' && (
                <div className="solicitacao-actions">
                  <button
                    className="btn-cancelar"
                    onClick={() => handleCancelar(solicitacao.id)}
                  >
                    Cancelar Solicitação
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MinhasSolicitacoes;

