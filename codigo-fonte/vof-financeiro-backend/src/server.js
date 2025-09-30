import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection, connectDatabase, disconnectDatabase } from './config/prisma.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import creditCardRoutes from './routes/creditCards.js';
import investmentRoutes from './routes/investments.js';
import noteRoutes from './routes/notes.js';
import userRoutes from './routes/users.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'VOF Financeiro Backend'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar ao banco de dados via Prisma
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }
    
    // Testar conexão
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🔄 Encerrando servidor...');
      await disconnectDatabase();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🔄 Encerrando servidor...');
      await disconnectDatabase();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();