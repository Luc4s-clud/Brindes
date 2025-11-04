import { useEffect, useState } from 'react';
import { brindesService } from '../services/brindes.service';
import './Home.css';

function Home() {
  const [stats, setStats] = useState({
    totalBrindes: 0,
    totalEstoque: 0,
    categorias: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const brindes = await brindesService.getAll();
        const totalEstoque = brindes.reduce((sum, b) => sum + b.quantidade, 0);
        const categoriasUnicas = new Set(brindes.map(b => b.categoria).filter(Boolean));
        
        setStats({
          totalBrindes: brindes.length,
          totalEstoque,
          categorias: categoriasUnicas.size,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="home">
      <h1>Bem-vindo ao Sistema de Gerenciamento de Brindes</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Total de Brindes</h2>
          <p className="stat-number">{stats.totalBrindes}</p>
        </div>
        
        <div className="stat-card">
          <h2>Total em Estoque</h2>
          <p className="stat-number">{stats.totalEstoque}</p>
        </div>
        
        <div className="stat-card">
          <h2>Categorias</h2>
          <p className="stat-number">{stats.categorias}</p>
        </div>
      </div>

      <div className="info-section">
        <h2>Funcionalidades</h2>
        <ul>
          <li>✅ Cadastro e gerenciamento de brindes</li>
          <li>✅ Controle de estoque</li>
          <li>✅ Categorização de produtos</li>
          <li>✅ Histórico de movimentações</li>
          <li>✅ Busca e filtros</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;

