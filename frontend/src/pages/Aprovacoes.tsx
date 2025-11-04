import { useEffect, useState } from 'react';
import { solicitacoesService, Solicitacao } from '../services/solicitacoes.service';
import { aprovacoesService } from '../services/aprovacoes.service';
import './Aprovacoes.css';

function Aprovacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('PENDENTE');

  useEffect(() => {
    loadSolicitacoes();
  }, [filtroStatus]);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroStatus) params.status = filtroStatus;
      const data = await solicitacoesService.getAll(params);
      setSolicitacoes(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      alert('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (solicitacaoId: number, observacao?: string) => {
    try {
      await aprovacoesService.aprovar(solicitacaoId, { observacao });
      alert('Solicitação aprovada com sucesso!');
      loadSolicitacoes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao aprovar solicitação');
    }
  };

  const handleRejeitar = async (solicitacaoId: number, observacao: string) => {
    if (!observacao.trim()) {
      alert('Informe o motivo da rejeição');
      return;
    }

    try {
      await aprovacoesService.rejeitar(solicitacaoId, { observacao });
      alert('Solicitação rejeitada');
      loadSolicitacoes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao rejeitar solicitação');
    }
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

  return (
    <div className="aprovacoes">
      <h1>Aprovações</h1>

      <div className="filters">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filter-select"
        >
          <option value="PENDENTE">Pendentes</option>
          <option value="APROVADA">Aprovadas</option>
          <option value="REJEITADA">Rejeitadas</option>
          <option value="">Todas</option>
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
            <div key={solicitacao.id} className="solicitacao-card-aprovacao">
              <div className="solicitacao-header">
                <div>
                  <h3>Solicitação #{solicitacao.numeroSolicitacao}</h3>
                  <p className="solicitacao-meta">
                    Solicitado por {solicitacao.solicitante?.nome} em {formatarData(solicitacao.createdAt)}
                  </p>
                </div>
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

              {solicitacao.status === 'PENDENTE' && (
                <div className="acoes-aprovacao">
                  <button
                    className="btn-aprovar"
                    onClick={() => handleAprovar(solicitacao.id)}
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    className="btn-rejeitar"
                    onClick={() => {
                      const observacao = prompt('Informe o motivo da rejeição:');
                      if (observacao) {
                        handleRejeitar(solicitacao.id, observacao);
                      }
                    }}
                  >
                    ✗ Rejeitar
                  </button>
                </div>
              )}

              {solicitacao.aprovacoes && solicitacao.aprovacoes.length > 0 && (
                <div className="historico-aprovacoes">
                  <h4>Histórico de Aprovações:</h4>
                  <ul>
                    {solicitacao.aprovacoes.map((aprovacao, idx) => (
                      <li key={idx}>
                        <span className={aprovacao.status === 'APROVADA' ? 'aprovado' : 'rejeitado'}>
                          {aprovacao.status === 'APROVADA' ? '✓' : '✗'}
                        </span>
                        {aprovacao.aprovadoPor?.nome} - {formatarData(aprovacao.createdAt)}
                        {aprovacao.observacao && (
                          <span className="observacao"> - {aprovacao.observacao}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Aprovacoes;

