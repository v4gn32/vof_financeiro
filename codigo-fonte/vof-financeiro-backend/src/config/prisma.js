// src/config/prisma.js
import { PrismaClient } from '../generated/prisma/index.js';

const logs =
  process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'];

const prisma = new PrismaClient({
  log: logs,
  errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL via Prisma');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL via Prisma:', error);
    return false;
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ Erro ao desconectar do PostgreSQL via Prisma:', error);
  }
};

export const testConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Teste de conexão OK');
    return true;
  } catch (error) {
    console.error('❌ Teste de conexão falhou:', error);
    return false;
  }
};

export default prisma;
