import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import brindesRoutes from './routes/brindes.routes';
import categoriasRoutes from './routes/categorias.routes';
import movimentacoesRoutes from './routes/movimentacoes.routes';
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import centrosCustoRoutes from './routes/centros-custo.routes';
import solicitacoesRoutes from './routes/solicitacoes.routes';
import aprovacoesRoutes from './routes/aprovacoes.routes';
import recomendacoesRoutes from './routes/recomendacoes.routes';
import dashboardRoutes from './routes/dashboard.routes';
import uploadRoutes from './routes/upload.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Configure a URL do seu frontend na Hostinger
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/centros-custo', centrosCustoRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);
app.use('/api/aprovacoes', aprovacoesRoutes);
app.use('/api/recomendacoes', recomendacoesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/brindes', brindesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API está funcionando!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

