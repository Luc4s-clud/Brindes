import { useEffect, useState } from 'react';
import { brindesService, Brinde } from '../services/brindes.service';
import { centrosCustoService, CentroCusto } from '../services/centros-custo.service';
import { solicitacoesService, ItemSolicitacao, CreateSolicitacaoData } from '../services/solicitacoes.service';
import './SolicitarBrindes.css';

function SolicitarBrindes() {
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [carrinho, setCarrinho] = useState<Array<ItemSolicitacao & { brinde: Brinde }>>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBrindes();
  }, [search, categoria]);

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
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadBrindes = async () => {
    try {
      const params: { categoria?: string; search?: string; ativo?: boolean } = { ativo: true };
      if (search) params.search = search;
      if (categoria) params.categoria = categoria;
      const data = await brindesService.getAll(params);
      setBrindes(data);
    } catch (error) {
      console.error('Erro ao carregar brindes:', error);
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
      alert('Selecione um centro de custo');
      return;
    }

    if (carrinho.length === 0) {
      alert('Adicione pelo menos um item ao carrinho');
      return;
    }

    try {
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
      alert('Solicitação criada com sucesso!');
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
      alert(error.response?.data?.error || 'Erro ao criar solicitação');
    }
  };

  const categorias = Array.from(new Set(brindes.map(b => b.categoria).filter(Boolean)));

  return (
    <div className="solicitar-brindes">
      <div className="page-header">
        <h1>Solicitar Brindes</h1>
        <div className="carrinho-info">
          <button 
            className="btn-carrinho" 
            onClick={() => setShowForm(true)}
            disabled={carrinho.length === 0}
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

      {/* Catálogo de Brindes */}
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="catalogo-grid">
          {brindes.map((brinde) => (
            <div key={brinde.id} className="brinde-card-catalogo">
              {brinde.fotoUrl && (
                <div className="brinde-foto">
                  <img 
                    src={`http://localhost:3001${brinde.fotoUrl}`} 
                    alt={brinde.nome}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="brinde-info-catalogo">
                <h3>{brinde.nome}</h3>
                {brinde.codigo && <span className="codigo-badge">{brinde.codigo}</span>}
                {brinde.categoria && <span className="categoria-badge">{brinde.categoria}</span>}
                <div className="info-rapida">
                  <span className="estoque">Estoque: {brinde.quantidade}</span>
                  {brinde.valorUnitario && (
                    <span className="preco">R$ {brinde.valorUnitario.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</span>
                  )}
                </div>
                <button
                  className="btn-adicionar"
                  onClick={() => adicionarAoCarrinho(brinde)}
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
      {showModal && brindeSelecionado && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-detalhes" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar" onClick={() => setShowModal(false)}>×</button>
            <h2>{brindeSelecionado.nome}</h2>
            {brindeSelecionado.fotoUrl && (
              <img 
                src={`http://localhost:3001${brindeSelecionado.fotoUrl}`}
                alt={brindeSelecionado.nome}
                className="foto-detalhes"
              />
            )}
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
            <button
              className="btn-adicionar-detalhes"
              onClick={() => {
                adicionarAoCarrinho(brindeSelecionado);
                setShowModal(false);
              }}
              disabled={brindeSelecionado.quantidade === 0}
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      )}

      {/* Modal de Solicitação */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <h2>Finalizar Solicitação</h2>
            
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
                          R$ {((item.valorUnitario || 0) * item.quantidade).toLocaleString('pt-BR', {
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
                <strong>Total: R$ {calcularTotal().toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</strong>
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
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SolicitarBrindes;

