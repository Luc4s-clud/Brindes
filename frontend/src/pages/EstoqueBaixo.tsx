import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { brindesService, Brinde } from '../services/brindes.service';
import { useToast } from '../contexts/ToastContext';
import { Loading } from '../components/Loading';
import { debounce } from '../utils/debounce';
import BrindeThumbnail from '../components/BrindeThumbnail';
import { getImageUrl } from '../utils/apiUrl';
import './EstoqueBaixo.css';

function EstoqueBaixo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tipoFiltro = searchParams.get('tipo') || 'baixo'; // 'baixo' ou 'sem'
  
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const { showError } = useToast();

  // Debounce da busca
  const debouncedLoadBrindes = useMemo(
    () => debounce(async (searchTerm: string, categoriaFilter: string, filtroTipo: string) => {
      try {
        setLoading(true);
        const params: any = { ativo: true };
        
        if (filtroTipo === 'baixo') {
          params.estoqueBaixo = true;
        } else if (filtroTipo === 'sem') {
          params.semEstoque = true;
        }
        
        if (searchTerm) params.search = searchTerm;
        if (categoriaFilter) params.categoria = categoriaFilter;
        
        const data = await brindesService.getAll(params);
        setBrindes(data);
      } catch (error) {
        console.error('Erro ao carregar brindes:', error);
        showError('Erro ao carregar brindes');
      } finally {
        setLoading(false);
      }
    }, 300),
    [showError]
  );

  useEffect(() => {
    debouncedLoadBrindes(search, categoria, tipoFiltro);
  }, [search, categoria, tipoFiltro, debouncedLoadBrindes]);

  const handleTipoChange = (novoTipo: string) => {
    setSearchParams({ tipo: novoTipo });
  };

  const categorias = useMemo(
    () => Array.from(new Set(brindes.map(b => b.categoria).filter(Boolean))),
    [brindes]
  );

  const getEstoqueStatus = (brinde: Brinde) => {
    if (brinde.quantidade === 0) {
      return { label: 'Sem Estoque', class: 'sem-estoque' };
    }
    if (brinde.estoqueMinimo !== null && brinde.quantidade <= brinde.estoqueMinimo) {
      return { label: 'Estoque Baixo', class: 'estoque-baixo' };
    }
    return null;
  };

  if (loading && brindes.length === 0) {
    return <Loading fullscreen message="Carregando brindes..." />;
  }

  return (
    <div className="estoque-baixo-page">
      <div className="page-header">
        <div>
          <h1>
            {tipoFiltro === 'baixo' ? '⚠️ Brindes com Estoque Baixo' : '🚫 Brindes sem Estoque'}
          </h1>
          <p className="page-subtitle">
            {tipoFiltro === 'baixo' 
              ? 'Brindes que estão abaixo ou no limite mínimo de estoque'
              : 'Brindes que estão completamente sem estoque'}
          </p>
        </div>
        <div className="filtro-tipo">
          <button
            className={`btn-tipo ${tipoFiltro === 'baixo' ? 'active' : ''}`}
            onClick={() => handleTipoChange('baixo')}
          >
            Estoque Baixo
          </button>
          <button
            className={`btn-tipo ${tipoFiltro === 'sem' ? 'active' : ''}`}
            onClick={() => handleTipoChange('sem')}
          >
            Sem Estoque
          </button>
        </div>
      </div>

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
        <Loading message="Carregando..." />
      ) : brindes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>
            {tipoFiltro === 'baixo' 
              ? 'Nenhum brinde com estoque baixo' 
              : 'Nenhum brinde sem estoque'}
          </h3>
          <p>Todos os brindes estão com estoque adequado!</p>
        </div>
      ) : (
        <>
          <div className="resumo-estoque">
            <div className="resumo-card">
              <span className="resumo-label">Total encontrado:</span>
              <span className="resumo-value">{brindes.length}</span>
            </div>
          </div>
          
          <div className="brindes-grid-estoque">
            {brindes.map((brinde) => {
              const status = getEstoqueStatus(brinde);
              return (
                <div key={brinde.id} className="brinde-card-estoque">
                  <div className="brinde-foto-container">
                    <BrindeThumbnail
                      nome={brinde.nome}
                      fotoUrl={brinde.fotoUrl}
                      size="large"
                      chavesAlternativas={[brinde.codigo, String(brinde.id)]}
                    />
                    {status && (
                      <div className={`status-badge ${status.class}`}>
                        {status.label}
                      </div>
                    )}
                  </div>

                  <div className="brinde-info-estoque">
                    <h3>{brinde.nome}</h3>
                    {brinde.codigo && (
                      <span className="codigo-badge">{brinde.codigo}</span>
                    )}
                    {brinde.categoria && (
                      <span className="categoria-badge">{brinde.categoria}</span>
                    )}
                    
                    <div className="info-detalhes">
                      <div className="info-row">
                        <span className="info-label">Estoque Atual:</span>
                        <span className={`info-value ${status?.class || ''}`}>
                          {brinde.quantidade} unidades
                        </span>
                      </div>
                      
                      {brinde.estoqueMinimo !== null && (
                        <div className="info-row">
                          <span className="info-label">Estoque Mínimo:</span>
                          <span className="info-value">{brinde.estoqueMinimo} unidades</span>
                        </div>
                      )}
                      
                      {brinde.valorUnitario && (
                        <div className="info-row">
                          <span className="info-label">Valor Unitário:</span>
                          <span className="info-value">
                            R$ {brinde.valorUnitario.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      
                      {brinde.fornecedor && (
                        <div className="info-row">
                          <span className="info-label">Fornecedor:</span>
                          <span className="info-value">{brinde.fornecedor}</span>
                        </div>
                      )}
                      
                      {brinde.validade && (
                        <div className="info-row">
                          <span className="info-label">Validade:</span>
                          <span className="info-value">
                            {new Date(brinde.validade).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {brinde.descricao && (
                      <p className="brinde-descricao">{brinde.descricao}</p>
                    )}

                    <div className="brinde-actions-estoque">
                      <button
                        className="btn-editar"
                        onClick={() => navigate(`/brindes?edit=${brinde.id}`)}
                      >
                        Editar Estoque
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default EstoqueBaixo;

