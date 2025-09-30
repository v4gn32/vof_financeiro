import { PrismaClient } from '../generated/prisma/index.js';

// Instância global do Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Função para conectar ao banco
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL via Prisma');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL via Prisma:', error);
    return false;
  }
};

// Função para desconectar do banco
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ Erro ao desconectar do PostgreSQL via Prisma:', error);
  }
};

// Função para testar conexão
export const testConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Teste de conexão com PostgreSQL via Prisma bem-sucedido');
    return true;
  } catch (error) {
    console.error('❌ Teste de conexão com PostgreSQL via Prisma falhou:', error);
    return false;
  }
};

export default prisma;