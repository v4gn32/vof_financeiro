import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testLoginSecurity() {
  console.log('🔍 TESTANDO SEGURANÇA DE LOGIN\n');

  // Teste 1: Login com email inexistente
  console.log('1️⃣ Testando login com email inexistente...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'naoexiste@teste.com',
        password: 'qualquersenha123'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Resposta:`, data);
    
    if (response.status === 401) {
      console.log('   ✅ SEGURO: Login rejeitado corretamente\n');
    } else {
      console.log('   🚨 VULNERÁVEL: Login aceito incorretamente!\n');
    }
  } catch (error) {
    console.log('   ❌ Erro na requisição:', error.message, '\n');
  }

  // Teste 2: Login com dados completamente inválidos
  console.log('2️⃣ Testando login com dados inválidos...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'emailinvalido',
        password: '123'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Resposta:`, data);
    
    if (response.status === 400 || response.status === 401) {
      console.log('   ✅ SEGURO: Login rejeitado corretamente\n');
    } else {
      console.log('   🚨 VULNERÁVEL: Login aceito incorretamente!\n');
    }
  } catch (error) {
    console.log('   ❌ Erro na requisição:', error.message, '\n');
  }

  // Teste 3: Login sem dados
  console.log('3️⃣ Testando login sem dados...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Resposta:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ SEGURO: Login rejeitado corretamente\n');
    } else {
      console.log('   🚨 VULNERÁVEL: Login aceito incorretamente!\n');
    }
  } catch (error) {
    console.log('   ❌ Erro na requisição:', error.message, '\n');
  }

  // Teste 4: Verificar se existe algum usuário de teste
  console.log('4️⃣ Testando login com usuário de teste conhecido...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teste@security.com',
        password: 'senha123'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Resposta:`, data);
    
    if (response.status === 200) {
      console.log('   ℹ️ Usuário de teste existe e login funcionou\n');
    } else {
      console.log('   ℹ️ Usuário de teste não existe ou credenciais incorretas\n');
    }
  } catch (error) {
    console.log('   ❌ Erro na requisição:', error.message, '\n');
  }

  // Teste 5: Verificar se há bypass de autenticação
  console.log('5️⃣ Testando possível bypass de autenticação...');
  const testEmails = [
    'admin@admin.com',
    'test@test.com', 
    'user@user.com',
    'demo@demo.com'
  ];

  for (const email of testEmails) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: 'password'
        })
      });

      const data = await response.json();
      console.log(`   ${email} - Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   🚨 ATENÇÃO: Login bem-sucedido com ${email}!`);
      }
    } catch (error) {
      console.log(`   ${email} - Erro:`, error.message);
    }
  }
}

// Executar testes
testLoginSecurity().catch(console.error);