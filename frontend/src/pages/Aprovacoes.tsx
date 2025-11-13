import { useEffect, useMemo, useState } from 'react';
import { solicitacoesService, Solicitacao } from '../services/solicitacoes.service';
import { aprovacoesService } from '../services/aprovacoes.service';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import './Aprovacoes.css';

type FiltroStatus =
  | 'TODAS'
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'ENTREGUE'
  | 'CANCELADA';

const statusLabels: Record<FiltroStatus, string> = {
  TODAS: 'Todas',
  PENDENTE: 'Pendentes',
  APROVADA: 'Aprovadas',
  REJEITADA: 'Rejeitadas',
  ENTREGUE: 'Entregues',
  CANCELADA: 'Canceladas',
};

const statusBadgeClass: Record<string, string> = {
  PENDENTE: 'badge-pendente',
  APROVADA: 'badge-aprovada',
  REJEITADA: 'badge-rejeitada',
  ENTREGUE: 'badge-entregue',
  CANCELADA: 'badge-cancelada',
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCurrency = (value?: number) => {
  if (!value) {
    return null;
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

interface ModalRejeicaoState {
  aberta: boolean;
  solicitacao: Solicitacao | null;
  motivo: string;
}

function Aprovacoes() {
  const { showError, showSuccess } = useToast();
  const { usuario } = useAuth();

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('PENDENTE');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [modalRejeicao, setModalRejeicao] = useState<ModalRejeicaoState>({
    aberta: false,
    solicitacao: null,
    motivo: '',
  });

  useEffect(() => {
    carregarSolicitacoes();
  }, [filtroStatus]);

  const carregarSolicitacoes = async () => {
    try {
      setLoading(true);
      const params =
        filtroStatus && filtroStatus !== 'TODAS'
          ? { status: filtroStatus }
          : undefined;

      const data = await solicitacoesService.getAll(params);
      setSolicitacoes(data);
    } catch (error: any) {
      console.error('[APROVACAO] Falha ao buscar solicitações', error);
      showError(
        error?.response?.data?.error ||
          'Não foi possível carregar as solicitações. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const listaFiltrada = useMemo(() => solicitacoes, [solicitacoes]);

  const totalPendentes = useMemo(
    () => solicitacoes.filter((s) => s.status === 'PENDENTE').length,
    [solicitacoes],
  );

  const abrirDetalhes = (solicitacao: Solicitacao) => {
    setSolicitacaoSelecionada((atual) =>
      atual && atual.id === solicitacao.id ? null : solicitacao,
    );
  };

  const aprovarSolicitacao = async (solicitacao: Solicitacao) => {
    try {
      await aprovacoesService.aprovar(solicitacao.id);
      showSuccess(`Solicitação ${solicitacao.numeroSolicitacao} aprovada com sucesso!`);
      await carregarSolicitacoes();
    } catch (error: any) {
      console.error('[APROVACAO] Erro ao aprovar', error);
      showError(error?.response?.data?.error || 'Erro ao aprovar solicitação.');
    }
  };

  const solicitarRejeicao = (solicitacao: Solicitacao) => {
    setModalRejeicao({
      aberta: true,
      solicitacao,
      motivo: '',
    });
  };

  const confirmarRejeicao = async () => {
    if (!modalRejeicao.solicitacao) {
      return;
    }

    if (!modalRejeicao.motivo.trim()) {
      showError('Informe o motivo da rejeição.');
      return;
    }

    try {
      await aprovacoesService.rejeitar(modalRejeicao.solicitacao.id, {
        observacao: modalRejeicao.motivo.trim(),
      });
      showSuccess(
        `Solicitação ${modalRejeicao.solicitacao.numeroSolicitacao} rejeitada com sucesso.`,
      );
      fecharModalRejeicao();
      await carregarSolicitacoes();
    } catch (error: any) {
      console.error('[APROVACAO] Erro ao rejeitar', error);
      showError(error?.response?.data?.error || 'Erro ao rejeitar solicitação.');
    }
  };

  const fecharModalRejeicao = () => {
    setModalRejeicao({
      aberta: false,
      solicitacao: null,
      motivo: '',
    });
  };

  return (
    <div className="aprovacoes-page">
      <div className="page-header">
        <div>
          <h1>Aprovação de Solicitações</h1>
          <p className="page-subtitle">
            {usuario?.perfil === 'DIRETOR'
              ? 'Gerencie as solicitações pendentes e acompanhe o histórico de decisões.'
              : 'Revise as solicitações pendentes e aprove conforme necessário.'}
          </p>
        </div>
        <div className="pendentes-badge">
          Pendentes <span>{totalPendentes}</span>
        </div>
      </div>

      <div className="aprovacoes-filtros">
        <div className="form-group inline">
          <label htmlFor="filtro-status">Status</label>
          <select
            id="filtro-status"
            value={filtroStatus}
            onChange={(event) => setFiltroStatus(event.target.value as FiltroStatus)}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando solicitações...</div>
      ) : listaFiltrada.length === 0 ? (
        <div className="empty-state">
          Nenhuma solicitação encontrada para o filtro selecionado.
        </div>
      ) : (
        <div className="solicitacoes-grid">
          {listaFiltrada.map((solicitacao) => {
            const isSelecionada = solicitacaoSelecionada?.id === solicitacao.id;
            const badgeClass = statusBadgeClass[solicitacao.status] || 'badge-pendente';

            return (
              <div
                key={solicitacao.id}
                className={`solicitacao-card ${isSelecionada ? 'expandida' : ''}`}
              >
                <header className="card-header">
                  <div>
                    <span className={`status-badge ${badgeClass}`}>
                      {solicitacao.status}
                    </span>
                    <h3>{solicitacao.numeroSolicitacao}</h3>
                    <p>
                      Solicitado por <strong>{solicitacao.solicitante?.nome}</strong> em{' '}
                      {formatDateTime(solicitacao.createdAt)}
                    </p>
                  </div>
                  <button
                    className="btn-detalhes"
                    onClick={() => abrirDetalhes(solicitacao)}
                    aria-expanded={isSelecionada}
                  >
                    {isSelecionada ? 'Recolher' : 'Detalhar'}
                  </button>
                </header>

                <section className="card-content">
                  <div className="info-coluna">
                    <div className="info-bloco">
                      <span className="info-label">Centro de custo</span>
                      <span className="info-valor">
                        {solicitacao.centroCusto?.nome || '—'}
                      </span>
                    </div>
                    <div className="info-bloco">
                      <span className="info-label">Finalidade</span>
                      <span className="info-valor">{solicitacao.finalidade || '—'}</span>
                    </div>
                  </div>

                  <div className="info-coluna">
                    <div className="info-bloco">
                      <span className="info-label">Prazo de entrega</span>
                      <span className="info-valor">
                        {solicitacao.prazoEntrega
                          ? formatDateTime(solicitacao.prazoEntrega)
                          : '—'}
                      </span>
                    </div>
                    <div className="info-bloco">
                      <span className="info-label">Valor total estimado</span>
                      <span className="info-valor destaque">
                        {formatCurrency(solicitacao.valorTotal) || '—'}
                      </span>
                    </div>
                  </div>
                </section>

                {isSelecionada && (
                  <div className="detalhes-expandido">
                    {solicitacao.justificativa && (
                      <div className="info-texto">
                        <span className="info-label">Justificativa</span>
                        <p>{solicitacao.justificativa}</p>
                      </div>
                    )}

                    {solicitacao.itens && solicitacao.itens.length > 0 && (
                      <div className="itens-solicitados">
                        <div className="itens-header">
                          <h4>Itens solicitados</h4>
                          <span>
                            {solicitacao.itens.reduce((total, item) => total + item.quantidade, 0)}{' '}
                            itens
                          </span>
                        </div>
                        <ul>
                          {solicitacao.itens.map((item) => (
                            <li key={`${item.brindeId}-${item.observacao || ''}`}>
                              <div>
                                <strong>{item.brinde?.nome || 'Brinde removido'}</strong>
                                <span className="item-quantidade">
                                  Quantidade: {item.quantidade}
                                </span>
                              </div>
                              <div className="item-valores">
                                {formatCurrency(item.valorUnitario) && (
                                  <span>
                                    Unitário: {formatCurrency(item.valorUnitario)}
                                  </span>
                                )}
                                {formatCurrency(
                                  item.valorUnitario
                                    ? item.valorUnitario * item.quantidade
                                    : undefined,
                                ) && (
                                  <span className="total-item">
                                    Total:{' '}
                                    {formatCurrency(
                                      item.valorUnitario
                                        ? item.valorUnitario * item.quantidade
                                        : undefined,
                                    )}
                                  </span>
                                )}
                              </div>
                              {item.observacao && (
                                <p className="item-observacao">Obs.: {item.observacao}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {solicitacao.aprovacoes && solicitacao.aprovacoes.length > 0 && (
                      <div className="historico-aprovacoes">
                        <h4>Histórico de decisões</h4>
                        <ul>
                          {solicitacao.aprovacoes.map((aprovacao) => (
                            <li key={aprovacao.id}>
                              <span
                                className={`marcador-historico ${
                                  aprovacao.status === 'APROVADA' ? 'aprovado' : 'rejeitado'
                                }`}
                              >
                                {aprovacao.status === 'APROVADA' ? '✓' : '✗'}
                              </span>
                              <div>
                                <strong>{aprovacao.aprovadoPor?.nome || 'Usuário'}</strong>
                                <span>{formatDateTime(aprovacao.createdAt)}</span>
                                {aprovacao.observacao && <p>{aprovacao.observacao}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {solicitacao.status === 'PENDENTE' && (
                      <div className="acoes-aprovacao">
                        <button
                          className="btn-aprovar"
                          onClick={() => aprovarSolicitacao(solicitacao)}
                        >
                          Aprovar solicitação
                        </button>
                        <button
                          className="btn-rejeitar"
                          onClick={() => solicitarRejeicao(solicitacao)}
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalRejeicao.aberta && modalRejeicao.solicitacao && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2>Rejeitar solicitação</h2>
            <p className="modal-descricao">
              Informe o motivo da rejeição para a solicitação{' '}
              <strong>{modalRejeicao.solicitacao.numeroSolicitacao}</strong>.
            </p>
            <textarea
              value={modalRejeicao.motivo}
              onChange={(event) =>
                setModalRejeicao((prev) => ({
                  ...prev,
                  motivo: event.target.value,
                }))
              }
              placeholder="Descreva o motivo da rejeição..."
              rows={4}
            />
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={fecharModalRejeicao}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" onClick={confirmarRejeicao}>
                Confirmar rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aprovacoes;

