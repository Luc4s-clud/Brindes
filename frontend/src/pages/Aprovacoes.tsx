import { useEffect, useMemo, useState } from 'react';
import { Solicitacao, ItemEntregaPayload } from '../services/solicitacoes.service';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useSolicitacoesQuery } from '../features/solicitacoes/api/useSolicitacoesQuery';
import { useAprovarSolicitacaoMutation } from '../features/aprovacoes/api/useAprovarSolicitacaoMutation';
import { useRejeitarSolicitacaoMutation } from '../features/aprovacoes/api/useRejeitarSolicitacaoMutation';
import { useRegistrarEntregaMutation } from '../features/solicitacoes/api/useRegistrarEntregaMutation';
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

interface ModalEntregaItem {
  itemId: number;
  nome: string;
  quantidadeSolicitada: number;
  quantidadeEntregue: number;
}

interface ModalEntregaState {
  aberta: boolean;
  solicitacao: Solicitacao | null;
  dataEntrega: string;
  observacao: string;
  itens: ModalEntregaItem[];
}

const formatDateTimeInput = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  const iso = date.toISOString();
  return iso.slice(0, 16);
};

function Aprovacoes() {
  const { showError, showSuccess } = useToast();
  const { usuario } = useAuth();

  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('PENDENTE');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [modalRejeicao, setModalRejeicao] = useState<ModalRejeicaoState>({
    aberta: false,
    solicitacao: null,
    motivo: '',
  });
  const [processing, setProcessing] = useState<{
    aprovando?: number | null;
    rejeitando?: number | null;
    entregando?: number | null;
  }>({});
  const [modalEntrega, setModalEntrega] = useState<ModalEntregaState>({
    aberta: false,
    solicitacao: null,
    dataEntrega: formatDateTimeInput(new Date()),
    observacao: '',
    itens: [],
  });

  const filtros = useMemo(() => {
    if (!filtroStatus || filtroStatus === 'TODAS') return {};
    return { status: filtroStatus };
  }, [filtroStatus]);

  const solicitacoesQuery = useSolicitacoesQuery(filtros);

  useEffect(() => {
    if (solicitacoesQuery.error) {
      console.error('[APROVACAO] Falha ao buscar solicitações', solicitacoesQuery.error);
      const error: any = solicitacoesQuery.error;
      showError(
        error?.response?.data?.error ||
          'Não foi possível carregar as solicitações. Tente novamente.',
      );
    }
  }, [solicitacoesQuery.error, showError]);

  const solicitacoes = solicitacoesQuery.data ?? [];
  const loading = solicitacoesQuery.isLoading;

  const totalPendentes = useMemo(
    () => solicitacoes.filter((s) => s.status === 'PENDENTE').length,
    [solicitacoes],
  );

  const abrirDetalhes = (solicitacao: Solicitacao) => {
    setSolicitacaoSelecionada((atual) =>
      atual && atual.id === solicitacao.id ? null : solicitacao,
    );
  };

  const aprovarMutation = useAprovarSolicitacaoMutation();
  const rejeitarMutation = useRejeitarSolicitacaoMutation();
  const registrarEntregaMutation = useRegistrarEntregaMutation();

  const isConfirmingEntrega =
    modalEntrega.aberta && modalEntrega.solicitacao
      ? processing.entregando === modalEntrega.solicitacao.id
      : false;

  const aprovarSolicitacao = async (solicitacao: Solicitacao) => {
    setProcessing((prev) => ({ ...prev, aprovando: solicitacao.id }));
    try {
      await aprovarMutation.mutateAsync(solicitacao.id);
      showSuccess(`Solicitação ${solicitacao.numeroSolicitacao} aprovada com sucesso!`);
    } catch (error: any) {
      console.error('[APROVACAO] Erro ao aprovar', error);
      showError(error?.response?.data?.error || 'Erro ao aprovar solicitação.');
    } finally {
      setProcessing((prev) => ({ ...prev, aprovando: null }));
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

    setProcessing((prev) => ({ ...prev, rejeitando: modalRejeicao.solicitacao?.id || null }));
    try {
      await rejeitarMutation.mutateAsync({
        solicitacaoId: modalRejeicao.solicitacao.id,
        observacao: modalRejeicao.motivo.trim(),
      });
      showSuccess(
        `Solicitação ${modalRejeicao.solicitacao.numeroSolicitacao} rejeitada com sucesso.`,
      );
      fecharModalRejeicao();
    } catch (error: any) {
      console.error('[APROVACAO] Erro ao rejeitar', error);
      showError(error?.response?.data?.error || 'Erro ao rejeitar solicitação.');
    } finally {
      setProcessing((prev) => ({ ...prev, rejeitando: null }));
    }
  };

  const fecharModalRejeicao = () => {
    setModalRejeicao({
      aberta: false,
      solicitacao: null,
      motivo: '',
    });
  };

  const abrirModalEntrega = (solicitacao: Solicitacao) => {
    setModalEntrega({
      aberta: true,
      solicitacao,
      dataEntrega: formatDateTimeInput(new Date()),
      observacao: solicitacao.observacoes || '',
      itens:
        solicitacao.itens?.map((item) => ({
          itemId: item.id!,
          nome: item.brinde?.nome || 'Brinde',
          quantidadeSolicitada: item.quantidade,
          quantidadeEntregue: item.quantidadeEntregue ?? item.quantidade,
        })) ?? [],
    });
  };

  const atualizarQuantidadeEntrega = (itemId: number, quantidade: number) => {
    setModalEntrega((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              quantidadeEntregue: quantidade,
            }
          : item,
      ),
    }));
  };

  const fecharModalEntrega = () => {
    setModalEntrega({
      aberta: false,
      solicitacao: null,
      dataEntrega: formatDateTimeInput(new Date()),
      observacao: '',
      itens: [],
    });
  };

  const confirmarEntrega = async () => {
    if (!modalEntrega.solicitacao) return;
    const solicitacaoAtual = modalEntrega.solicitacao;

    setProcessing((prev) => ({ ...prev, entregando: solicitacaoAtual.id }));
    try {
      const itensPayload: ItemEntregaPayload[] = modalEntrega.itens.map((item) => ({
        itemId: item.itemId,
        quantidadeEntregue: item.quantidadeEntregue,
      }));

      await registrarEntregaMutation.mutateAsync({
        solicitacaoId: solicitacaoAtual.id,
        payload: {
          dataEntrega: modalEntrega.dataEntrega
            ? new Date(modalEntrega.dataEntrega).toISOString()
            : undefined,
          observacaoEntrega: modalEntrega.observacao,
          itensEntregues: itensPayload,
        },
      });

      showSuccess('Entrega registrada com sucesso!');
      fecharModalEntrega();
    } catch (error: any) {
      console.error('[APROVACAO] Erro ao registrar entrega', error);
      showError(error?.response?.data?.error || 'Erro ao registrar entrega.');
    } finally {
      setProcessing((prev) => ({ ...prev, entregando: null }));
    }
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
      ) : solicitacoes.length === 0 ? (
        <div className="empty-state">
          Nenhuma solicitação encontrada para o filtro selecionado.
        </div>
      ) : (
        <div className="solicitacoes-grid">
          {solicitacoes.map((solicitacao) => {
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
                                {typeof item.quantidadeEntregue === 'number' && (
                                  <span className="item-quantidade-entregue">
                                    Entregue: {item.quantidadeEntregue}
                                  </span>
                                )}
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
                          disabled={processing.aprovando === solicitacao.id}
                        >
                          {processing.aprovando === solicitacao.id
                            ? 'Aprovando...'
                            : 'Aprovar solicitação'}
                        </button>
                        <button
                          className="btn-rejeitar"
                          onClick={() => solicitarRejeicao(solicitacao)}
                          disabled={processing.rejeitando === solicitacao.id}
                        >
                          {processing.rejeitando === solicitacao.id ? 'Rejeitando...' : 'Rejeitar'}
                        </button>
                      </div>
                    )}

                    {solicitacao.status === 'APROVADA' && (
                      <div className="acoes-aprovacao">
                        <button
                          className="btn-entregar"
                          onClick={() => abrirModalEntrega(solicitacao)}
                          disabled={processing.entregando === solicitacao.id}
                        >
                          {processing.entregando === solicitacao.id
                            ? 'Registrando...'
                            : 'Registrar entrega'}
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
              <button
                type="button"
                className="btn-danger"
                onClick={confirmarRejeicao}
                disabled={
                  !!modalRejeicao.solicitacao &&
                  processing.rejeitando === modalRejeicao.solicitacao.id
                }
              >
                {processing.rejeitando === modalRejeicao.solicitacao?.id
                  ? 'Rejeitando...'
                  : 'Confirmar rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEntrega.aberta && modalEntrega.solicitacao && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content entrega-modal" onClick={(event) => event.stopPropagation()}>
            <h2>Registrar entrega</h2>
            <p className="modal-descricao">
              Confirme as quantidades entregues para a solicitação{' '}
              <strong>{modalEntrega.solicitacao.numeroSolicitacao}</strong>.
            </p>

            <div className="modal-section">
              <label htmlFor="data-entrega">Data da entrega</label>
              <input
                id="data-entrega"
                type="datetime-local"
                value={modalEntrega.dataEntrega}
                onChange={(event) =>
                  setModalEntrega((prev) => ({
                    ...prev,
                    dataEntrega: event.target.value,
                  }))
                }
              />
            </div>

            <div className="modal-section">
              <label>Itens entregues</label>
              <div className="entrega-itens">
                {modalEntrega.itens.map((item) => (
                  <div key={item.itemId} className="entrega-item">
                    <div>
                      <strong>{item.nome}</strong>
                      <span className="entrega-item-solicitado">
                        Solicitado: {item.quantidadeSolicitada}
                      </span>
                    </div>
                    <div className="entrega-item-input">
                      <label htmlFor={`entrega-${item.itemId}`}>Entregue</label>
                      <input
                        id={`entrega-${item.itemId}`}
                        type="number"
                        min={0}
                        max={item.quantidadeSolicitada}
                        value={item.quantidadeEntregue}
                        onChange={(event) =>
                          atualizarQuantidadeEntrega(item.itemId, Number(event.target.value))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <label htmlFor="observacao-entrega">Observações</label>
              <textarea
                id="observacao-entrega"
                rows={3}
                value={modalEntrega.observacao}
                onChange={(event) =>
                  setModalEntrega((prev) => ({
                    ...prev,
                    observacao: event.target.value,
                  }))
                }
                placeholder="Informações adicionais da entrega (opcional)"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={fecharModalEntrega}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-aprovar"
                onClick={confirmarEntrega}
                disabled={isConfirmingEntrega}
              >
                {isConfirmingEntrega ? 'Salvando...' : 'Confirmar entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aprovacoes;

