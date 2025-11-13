import { useEffect, useState, useMemo } from 'react';
import { brindesService, Brinde } from '../services/brindes.service';
import { centrosCustoService, CentroCusto } from '../services/centros-custo.service';
import { solicitacoesService, ItemSolicitacao, CreateSolicitacaoData } from '../services/solicitacoes.service';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { debounce } from '../utils/debounce';
import BrindeThumbnail from '../components/BrindeThumbnail';
import './SolicitarBrindes.css';

function SolicitarBrindes() {
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [carrinho, setCarrinho] = useState<Array<ItemSolicitacao & { brinde: Brinde }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [brindeSelecionado, setBrindeSelecionado] = useState<Brinde | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    centroCustoId: '',
    justificativa: '',
    enderecoEntrega: '',
    prazoEntrega: '',
    finalidade: '',
    observacoes: '',
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  // Debounce da busca
  const debouncedLoadBrindes = useMemo(
    () => debounce(async (searchTerm: string, categoriaFilter: string) => {
      try {
        const params: { categoria?: string; search?: string; ativo?: boolean } = { ativo: true };
        if (searchTerm) params.search = searchTerm;
        if (categoriaFilter) params.categoria = categoriaFilter;
        const data = await brindesService.getAll(params);
        setBrindes(data);
      } catch (error) {
        console.error('Erro ao carregar brindes:', error);
        showError('Erro ao carregar brindes');
      }
    }, 300),
    [showError]
  );

  useEffect(() => {
    debouncedLoadBrindes(search, categoria);
  }, [search, categoria, debouncedLoadBrindes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [brindesData, centrosCustoData] = await Promise.all([
        brindesService.getAll({ ativo: true }),
        centrosCustoService.getAll({ ativo: true }),
      ]);
      setBrindes(brindesData);
      setCentrosCusto(centrosCustoData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (brinde: Brinde) => {
    const itemExistente = carrinho.find(item => item.brindeId === brinde.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.brindeId === brinde.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        brindeId: brinde.id,
        quantidade: 1,
        valorUnitario: brinde.valorUnitario,
        brinde: brinde,
      }]);
    }
  };

  const removerDoCarrinho = (brindeId: number) => {
    setCarrinho(carrinho.filter(item => item.brindeId !== brindeId));
  };

  const atualizarQuantidade = (brindeId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(brindeId);
      return;
    }
    setCarrinho(carrinho.map(item =>
      item.brindeId === brindeId
        ? { ...item, quantidade }
        : item
    ));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      return total + (item.valorUnitario || 0) * item.quantidade;
    }, 0);
  };

  const handleSubmitSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.centroCustoId) {
      showError('Selecione um centro de custo');
      return;
    }

    if (carrinho.length === 0) {
      showError('Adicione pelo menos um item ao carrinho');
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateSolicitacaoData = {
        centroCustoId: parseInt(formData.centroCustoId),
        justificativa: formData.justificativa,
        enderecoEntrega: formData.enderecoEntrega,
        prazoEntrega: formData.prazoEntrega || undefined,
        finalidade: formData.finalidade,
        observacoes: formData.observacoes,
        itens: carrinho.map(item => ({
          brindeId: item.brindeId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          observacao: item.observacao,
        })),
      };

      await solicitacoesService.create(data);
      showSuccess('Solicitação criada com sucesso!');
      setCarrinho([]);
      setFormData({
        centroCustoId: '',
        justificativa: '',
        enderecoEntrega: '',
        prazoEntrega: '',
        finalidade: '',
        observacoes: '',
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error);
      showError(error.response?.data?.error || 'Erro ao criar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  const categorias = useMemo(
    () => Array.from(new Set(brindes.map(b => b.categoria).filter(Boolean))),
    [brindes]
  );

  if (loading && brindes.length === 0) {
    return <Loading fullscreen message="Carregando brindes..." />;
  }

  return (
    <div className="solicitar-brindes">
      <div className="page-header">
        <h1>Solicitar Brindes</h1>
        <div className="carrinho-info">
          <button 
            className="btn-carrinho" 
            onClick={() => setShowForm(true)}
            disabled={carrinho.length === 0}
            aria-label={`Carrinho com ${carrinho.length} itens`}
          >
            🛒 Carrinho ({carrinho.length}) - R$ {calcularTotal().toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar brindes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          aria-label="Buscar brindes"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="filter-select"
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Catálogo de Brindes */}
      {loading ? (
        <Loading message="Carregando..." />
      ) : brindes.length === 0 ? (
        <div className="empty-state">Nenhum brinde encontrado</div>
      ) : (
        <div className="catalogo-grid">
          {brindes.map((brinde) => (
            <div key={brinde.id} className="brinde-card-catalogo">
              <div className="brinde-foto">
                <BrindeThumbnail
                  nome={brinde.nome}
                  fotoUrl={brinde.fotoUrl}
                  size="large"
                  chavesAlternativas={[brinde.codigo, String(brinde.id)]}
                />
              </div>

              <div className="brinde-info-catalogo">
                <h3>{brinde.nome}</h3>
                {brinde.codigo && <span className="codigo-badge">{brinde.codigo}</span>}
                {brinde.categoria && <span className="categoria-badge">{brinde.categoria}</span>}
                <div className="info-rapida">
                  <span className="estoque">Estoque: {brinde.quantidade}</span>
                  {brinde.valorUnitario && (
                    <span className="preco">
                      R$ {brinde.valorUnitario.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
                <button
                  className="btn-adicionar"
                  onClick={() => {
                    adicionarAoCarrinho(brinde);
                    showSuccess(`${brinde.nome} adicionado ao carrinho!`);
                  }}
                  disabled={brinde.quantidade === 0}
                >
                  {brinde.quantidade === 0 ? 'Sem estoque' : '+ Adicionar'}
                </button>
              </div>

              <button
                className="btn-detalhes"
                onClick={() => {
                  setBrindeSelecionado(brinde);
                  setShowModal(true);
                }}
              >
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={brindeSelecionado?.nome}
        size="medium"
      >
        {brindeSelecionado && (
          <>
            <div className="foto-detalhes">
              <BrindeThumbnail
                nome={brindeSelecionado.nome}
                fotoUrl={brindeSelecionado.fotoUrl}
                size="large"
                chavesAlternativas={[brindeSelecionado.codigo, String(brindeSelecionado.id)]}
              />
            </div>
            <div className="detalhes-completos">
              {brindeSelecionado.codigo && <p><strong>Código:</strong> {brindeSelecionado.codigo}</p>}
              {brindeSelecionado.descricao && <p><strong>Descrição:</strong> {brindeSelecionado.descricao}</p>}
              {brindeSelecionado.especificacoes && <p><strong>Especificações:</strong> {brindeSelecionado.especificacoes}</p>}
              {brindeSelecionado.recomendacaoUso && <p><strong>Recomendação:</strong> {brindeSelecionado.recomendacaoUso}</p>}
              <p><strong>Estoque:</strong> {brindeSelecionado.quantidade}</p>
              {brindeSelecionado.valorUnitario && (
                <p><strong>Valor Unitário:</strong> R$ {brindeSelecionado.valorUnitario.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</p>
              )}
              {brindeSelecionado.fornecedor && <p><strong>Fornecedor:</strong> {brindeSelecionado.fornecedor}</p>}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                className="btn-adicionar-detalhes"
                onClick={() => {
                  adicionarAoCarrinho(brindeSelecionado);
                  setShowModal(false);
                  showSuccess(`${brindeSelecionado.nome} adicionado ao carrinho!`);
                }}
                disabled={brindeSelecionado.quantidade === 0}
                style={{ flex: 1 }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal de Solicitação */}
      <Modal
        isOpen={showForm}
        onClose={() => !submitting && setShowForm(false)}
        title="Finalizar Solicitação"
        size="large"
      >
        <div className="modal-solicitacao">
          <div className="carrinho-resumo">
            <h3>Itens no Carrinho ({carrinho.length})</h3>
            <ul className="carrinho-lista">
              {carrinho.map((item) => (
                <li key={item.brindeId}>
                  <div className="item-info">
                    <span>{item.brinde.nome}</span>
                    <div className="item-controles">
                      <button
                        onClick={() => atualizarQuantidade(item.brindeId, item.quantidade - 1)}
                        className="btn-qtd"
                      >
                        -
                      </button>
                      <span>{item.quantidade}</span>
                      <button
                        onClick={() => atualizarQuantidade(item.brindeId, item.quantidade + 1)}
                        className="btn-qtd"
                        disabled={item.quantidade >= item.brinde.quantidade}
                      >
                        +
                      </button>
                      <span className="item-total">
                        R${' '}
                        {((item.valorUnitario || 0) * item.quantidade).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <button
                        onClick={() => removerDoCarrinho(item.brindeId)}
                        className="btn-remover"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="total-carrinho">
              <strong>
                Total:{' '}
                {calcularTotal().toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </div>
          </div>

          <form onSubmit={handleSubmitSolicitacao}>
            <div className="form-group">
              <label>Centro de Custo *</label>
              <select
                value={formData.centroCustoId}
                onChange={(e) => setFormData({ ...formData, centroCustoId: e.target.value })}
                required
              >
                <option value="">Selecione um centro de custo</option>
                {centrosCusto.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.nome} {cc.setor && `(${cc.setor})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Justificativa *</label>
              <textarea
                value={formData.justificativa}
                onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                rows={3}
                required
                placeholder="Explique a necessidade dos brindes..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Finalidade</label>
                <input
                  type="text"
                  value={formData.finalidade}
                  onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                  placeholder="Ex: Expodireto, Visita Técnica..."
                />
              </div>

              <div className="form-group">
                <label>Prazo de Entrega</label>
                <input
                  type="date"
                  value={formData.prazoEntrega}
                  onChange={(e) => setFormData({ ...formData, prazoEntrega: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Endereço de Entrega</label>
              <textarea
                value={formData.enderecoEntrega}
                onChange={(e) => setFormData({ ...formData, enderecoEntrega: e.target.value })}
                rows={2}
                placeholder="Endereço completo para entrega..."
              />
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default SolicitarBrindes;

