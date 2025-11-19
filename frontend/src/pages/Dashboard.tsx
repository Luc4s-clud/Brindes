import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, Estatisticas } from '../services/dashboard.service';
import { useAuth } from '../contexts/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();
  const navigate = useNavigate();

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

        <div 
          className="stat-card danger clickable" 
          onClick={() => navigate('/estoque-baixo?tipo=sem')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <h3>Sem Estoque</h3>
            <p className="stat-number">
              {estatisticas.brindes.total - estatisticas.brindes.comEstoque}
            </p>
            <p className="stat-subtitle">Clique para ver detalhes</p>
          </div>
        </div>

        <div 
          className="stat-card warning clickable" 
          onClick={() => navigate('/estoque-baixo?tipo=baixo')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Estoque Baixo</h3>
            <p className="stat-number">{estatisticas.brindes.estoqueBaixo}</p>
            <p className="stat-subtitle">Clique para ver detalhes</p>
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

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Gráfico de Pizza - Status das Solicitações */}
        <div className="chart-card">
          <h2>📊 Status das Solicitações</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pendentes', value: estatisticas.solicitacoes.pendentes, color: '#f39c12' },
                  { name: 'Aprovadas', value: estatisticas.solicitacoes.aprovadas, color: '#3498db' },
                  { name: 'Entregues', value: estatisticas.solicitacoes.entregues, color: '#27ae60' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Pendentes', value: estatisticas.solicitacoes.pendentes, color: '#f39c12' },
                  { name: 'Aprovadas', value: estatisticas.solicitacoes.aprovadas, color: '#3498db' },
                  { name: 'Entregues', value: estatisticas.solicitacoes.entregues, color: '#27ae60' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição de Estoque */}
        <div className="chart-card">
          <h2>📦 Distribuição de Estoque</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Com Estoque', value: estatisticas.brindes.comEstoque, color: '#27ae60' },
                  { name: 'Estoque Baixo', value: estatisticas.brindes.estoqueBaixo, color: '#f39c12' },
                  { name: 'Sem Estoque', value: Math.max(0, estatisticas.brindes.total - estatisticas.brindes.comEstoque), color: '#e74c3c' },
                  { name: 'Vencendo', value: estatisticas.brindes.vencendo, color: '#9b59b6' },
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Com Estoque', value: estatisticas.brindes.comEstoque, color: '#27ae60' },
                  { name: 'Estoque Baixo', value: estatisticas.brindes.estoqueBaixo, color: '#f39c12' },
                  { name: 'Sem Estoque', value: Math.max(0, estatisticas.brindes.total - estatisticas.brindes.comEstoque), color: '#e74c3c' },
                  { name: 'Vencendo', value: estatisticas.brindes.vencendo, color: '#9b59b6' },
                ].filter(item => item.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Brindes Mais Solicitados */}
        <div className="chart-card full-width">
          <h2>🏆 Brindes Mais Solicitados</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={estatisticas.rankings.brindesMaisSolicitados.slice(0, 10).map((item) => ({
                name: item.brinde.nome.length > 20 
                  ? item.brinde.nome.substring(0, 20) + '...' 
                  : item.brinde.nome,
                quantidade: item.quantidadeTotal,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} unidades`, 'Quantidade']}
              />
              <Legend />
              <Bar dataKey="quantidade" fill="#667eea" name="Quantidade Solicitada" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Consumo por Centro de Custo */}
        <div className="chart-card full-width">
          <h2>💼 Consumo por Centro de Custo</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={estatisticas.rankings.consumoPorCentroCusto.slice(0, 10).map((item) => ({
                name: item.centroCusto.nome.length > 20 
                  ? item.centroCusto.nome.substring(0, 20) + '...' 
                  : item.centroCusto.nome,
                valor: Number(item.valorTotal) || 0,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  'Valor Total'
                ]}
              />
              <Legend />
              <Bar dataKey="valor" fill="#3498db" name="Valor Total (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Top Solicitantes */}
        <div className="chart-card full-width">
          <h2>👥 Top Solicitantes</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={estatisticas.rankings.topSolicitantes.slice(0, 10).map((item) => ({
                name: item.usuario.nome.length > 20 
                  ? item.usuario.nome.substring(0, 20) + '...' 
                  : item.usuario.nome,
                solicitacoes: item.totalSolicitacoes,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} solicitações`, 'Total']}
              />
              <Legend />
              <Bar dataKey="solicitacoes" fill="#9b59b6" name="Total de Solicitações" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings em formato de lista (mantido para referência) */}
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

