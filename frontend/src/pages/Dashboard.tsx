import { useEffect, useState } from 'react';
import { dashboardService, Estatisticas } from '../services/dashboard.service';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    loadEstatisticas();
  }, []);

  const loadEstatisticas = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEstatisticas();
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando estatísticas...</div>;
  }

  if (!estatisticas) {
    return <div className="error-state">Erro ao carregar dados</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome">Bem-vindo, {usuario?.nome}!</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total de Brindes</h3>
            <p className="stat-number">{estatisticas.brindes.total}</p>
            <p className="stat-subtitle">{estatisticas.brindes.comEstoque} com estoque</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Estoque Baixo</h3>
            <p className="stat-number">{estatisticas.brindes.estoqueBaixo}</p>
            <p className="stat-subtitle">Necessita atenção</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Valor em Estoque</h3>
            <p className="stat-number">
              R$ {estatisticas.brindes.valorTotalEstoque.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Solicitações Pendentes</h3>
            <p className="stat-number">{estatisticas.solicitacoes.pendentes}</p>
            <p className="stat-subtitle">
              {estatisticas.solicitacoes.aprovadas} aprovadas
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Valor Aprovado</h3>
            <p className="stat-number">
              R$ {estatisticas.solicitacoes.valorTotalAprovado.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <h3>Entregues</h3>
            <p className="stat-number">{estatisticas.solicitacoes.entregues}</p>
            <p className="stat-subtitle">
              R$ {estatisticas.solicitacoes.valorTotalEntregue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="rankings-grid">
        <div className="ranking-card">
          <h2>🏆 Brindes Mais Solicitados</h2>
          <ul className="ranking-list">
            {estatisticas.rankings.brindesMaisSolicitados.map((item, idx) => (
              <li key={idx}>
                <span className="rank-number">{idx + 1}º</span>
                <span className="rank-name">{item.brinde.nome}</span>
                <span className="rank-value">{item.quantidadeTotal} unidades</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ranking-card">
          <h2>👥 Top Solicitantes</h2>
          <ul className="ranking-list">
            {estatisticas.rankings.topSolicitantes.map((item, idx) => (
              <li key={idx}>
                <span className="rank-number">{idx + 1}º</span>
                <span className="rank-name">{item.usuario.nome}</span>
                <span className="rank-value">{item.totalSolicitacoes} solicitações</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ranking-card">
          <h2>💼 Consumo por Centro de Custo</h2>
          <ul className="ranking-list">
            {estatisticas.rankings.consumoPorCentroCusto.map((item, idx) => (
              <li key={idx}>
                <span className="rank-number">{idx + 1}º</span>
                <span className="rank-name">{item.centroCusto.nome}</span>
                <span className="rank-value">
                  R$ {item.valorTotal?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

