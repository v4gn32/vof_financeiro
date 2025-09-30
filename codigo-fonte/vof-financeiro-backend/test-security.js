import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Função para testar uma rota protegida
async function testProtectedRoute(endpoint, method = 'GET', token = null, body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      success: false
    };
  }
}

// Função para fazer login e obter token
async function login(email, password) {
  const response = await testProtectedRoute('/api/auth/login', 'POST', null, {
    email,
    password
  });
  
  if (response.success && response.data.token) {
    return response.data.token;
  }
  
  return null;
}

// Testes de segurança
async function runSecurityTests() {
  console.log('🔒 Iniciando testes de segurança...\n');
  
  // 1. Testar acesso sem token
  console.log('1. Testando acesso sem token de autenticação:');
  const protectedRoutes = [
    '/api/users/profile',
    '/api/transactions',
    '/api/investments',
    '/api/credit-cards',
    '/api/notes'
  ];
  
  for (const route of protectedRoutes) {
    const result = await testProtectedRoute(route);
    console.log(`   ${route}: ${result.status === 401 ? '✅ BLOQUEADO' : '❌ VULNERÁVEL'} (Status: ${result.status})`);
    if (result.status !== 401) {
      console.log(`      Resposta: ${JSON.stringify(result.data)}`);
    }
  }
  
  console.log('\n2. Testando acesso com token inválido:');
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJlbWFpbCI6InRlc3RlQHRlc3RlLmNvbSIsImlhdCI6MTYzMDAwMDAwMH0.invalid_signature';
  
  for (const route of protectedRoutes) {
    const result = await testProtectedRoute(route, 'GET', invalidToken);
    console.log(`   ${route}: ${result.status === 403 || result.status === 401 ? '✅ BLOQUEADO' : '❌ VULNERÁVEL'} (Status: ${result.status})`);
  }
  
  console.log('\n3. Testando login com credenciais válidas:');
  const validToken = await login('admin@voffinanceiro.com', 'admin123');
  
  if (validToken) {
    console.log('   ✅ Login bem-sucedido - Token obtido');
    
    console.log('\n4. Testando acesso com token válido:');
    for (const route of protectedRoutes) {
      const result = await testProtectedRoute(route, 'GET', validToken);
      console.log(`   ${route}: ${result.success ? '✅ ACESSO PERMITIDO' : '❌ ACESSO NEGADO'} (Status: ${result.status})`);
    }
    
    console.log('\n5. Testando acesso a rotas administrativas:');
    const adminRoutes = [
      '/api/users',
      '/api/admin/users'
    ];
    
    for (const route of adminRoutes) {
      const result = await testProtectedRoute(route, 'GET', validToken);
      console.log(`   ${route}: ${result.success ? '✅ ACESSO PERMITIDO (ADMIN)' : '❌ ACESSO NEGADO'} (Status: ${result.status})`);
    }
    
  } else {
    console.log('   ❌ Falha no login - Não foi possível obter token');
  }
  
  console.log('\n6. Testando tentativa de login com credenciais inválidas:');
  const invalidLogin = await testProtectedRoute('/api/auth/login', 'POST', null, {
    email: 'usuario@inexistente.com',
    password: 'senhaerrada'
  });
  console.log(`   Login inválido: ${invalidLogin.status === 401 ? '✅ BLOQUEADO' : '❌ VULNERÁVEL'} (Status: ${invalidLogin.status})`);
  
  console.log('\n7. Testando registro de usuário:');
  const registerTest = await testProtectedRoute('/api/auth/register', 'POST', null, {
    name: 'Usuário Teste',
    email: 'teste@security.com',
    password: 'senha123'
  });
  console.log(`   Registro: ${registerTest.success ? '✅ PERMITIDO' : '❌ BLOQUEADO'} (Status: ${registerTest.status})`);
  
  if (registerTest.success) {
    console.log('   ⚠️  Novo usuário criado para teste');
    
    // Testar login com novo usuário
    const newUserToken = await login('teste@security.com', 'senha123');
    if (newUserToken) {
      console.log('   ✅ Login com novo usuário bem-sucedido');
      
      // Testar se novo usuário pode acessar dados de outros usuários
      console.log('\n8. Testando isolamento de dados entre usuários:');
      const userDataTest = await testProtectedRoute('/api/transactions', 'GET', newUserToken);
      console.log(`   Acesso a transações: ${userDataTest.success ? '✅ PERMITIDO' : '❌ NEGADO'} (Status: ${userDataTest.status})`);
      
      // Tentar acessar dados de outro usuário específico
      const otherUserDataTest = await testProtectedRoute('/api/users/1/transactions', 'GET', newUserToken);
      console.log(`   Acesso a dados de outro usuário: ${otherUserDataTest.status === 403 ? '✅ BLOQUEADO' : '❌ VULNERÁVEL'} (Status: ${otherUserDataTest.status})`);
    }
  }
  
  console.log('\n🔒 Testes de segurança concluídos!');
}

// Executar testes
runSecurityTests().catch(console.error);