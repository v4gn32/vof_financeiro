import { testConnection } from './src/config/database.js';

console.log('🔍 Testando conexão com PostgreSQL...\n');

async function runTest() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Teste de conexão bem-sucedido!');
      console.log('📋 Configurações utilizadas:');
      console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`   - Porta: ${process.env.DB_PORT || '5432'}`);
      console.log(`   - Banco: ${process.env.DB_NAME || 'db_financeiro'}`);
      console.log(`   - Usuário: ${process.env.DB_USER || 'vagneradmin'}`);
      console.log('\n🎉 O backend está pronto para conectar ao PostgreSQL!');
    } else {
      console.log('❌ Falha na conexão com PostgreSQL');
      console.log('\n📝 Verifique:');
      console.log('   1. Se o PostgreSQL está rodando');
      console.log('   2. Se o banco "db_financeiro" existe');
      console.log('   3. Se o usuário "vagneradmin" tem permissões');
      console.log('   4. Se as credenciais no .env estão corretas');
    }
  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message);
  }
  
  process.exit(0);
}

runTest();