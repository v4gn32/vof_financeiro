import prisma from './src/config/prisma.js';

// Função para limpar usuários inativos
async function cleanupInactiveUsers() {
  console.log('🧹 Iniciando limpeza de usuários inativos...\n');
  
  try {
    // Data limite: 6 meses atrás
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    console.log(`📅 Buscando usuários inativos desde: ${sixMonthsAgo.toISOString()}`);
    
    // Buscar usuários que não fizeram login há mais de 6 meses
    // e não têm transações, investimentos, cartões ou notas
    const inactiveUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            role: 'USER' // Não remover admins
          },
          {
            createdAt: {
              lt: sixMonthsAgo
            }
          },
          {
            transactions: {
              none: {}
            }
          },
          {
            investments: {
              none: {}
            }
          },
          {
            creditCards: {
              none: {}
            }
          },
          {
            notes: {
              none: {}
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log(`👥 Encontrados ${inactiveUsers.length} usuários inativos:`);
    
    if (inactiveUsers.length === 0) {
      console.log('✅ Nenhum usuário inativo encontrado para remoção.');
      return;
    }
    
    // Listar usuários que serão removidos
    inactiveUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Criado em: ${user.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n⚠️  ATENÇÃO: Esta operação irá remover permanentemente estes usuários!');
    console.log('💡 Para executar a remoção, descomente as linhas de remoção no script.\n');
    
    // DESCOMENTE AS LINHAS ABAIXO PARA EXECUTAR A REMOÇÃO
    /*
    console.log('🗑️  Removendo usuários inativos...');
    
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          in: inactiveUsers.map(user => user.id)
        }
      }
    });
    
    console.log(`✅ ${deletedUsers.count} usuários removidos com sucesso!`);
    */
    
    // Estatísticas gerais
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          {
            transactions: {
              some: {}
            }
          },
          {
            investments: {
              some: {}
            }
          },
          {
            creditCards: {
              some: {}
            }
          },
          {
            notes: {
              some: {}
            }
          },
          {
            role: 'ADMIN'
          }
        ]
      }
    });
    
    console.log('📊 Estatísticas do sistema:');
    console.log(`   Total de usuários: ${totalUsers}`);
    console.log(`   Usuários ativos: ${activeUsers}`);
    console.log(`   Usuários inativos: ${inactiveUsers.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para limpar dados de teste
async function cleanupTestData() {
  console.log('\n🧪 Limpando dados de teste...\n');
  
  try {
    // Remover usuários de teste (emails que contêm 'test', 'teste' ou domínios de teste)
    const testUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            role: 'USER' // Não remover admins
          },
          {
            OR: [
              {
                email: {
                  contains: 'test'
                }
              },
              {
                email: {
                  contains: 'teste'
                }
              },
              {
                email: {
                  endsWith: '@test.com'
                }
              },
              {
                email: {
                  endsWith: '@teste.com'
                }
              },
              {
                email: {
                  endsWith: '@example.com'
                }
              },
              {
                email: {
                  endsWith: '@security.com'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log(`🧪 Encontrados ${testUsers.length} usuários de teste:`);
    
    if (testUsers.length === 0) {
      console.log('✅ Nenhum usuário de teste encontrado.');
      return;
    }
    
    testUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    // DESCOMENTE AS LINHAS ABAIXO PARA EXECUTAR A REMOÇÃO
    /*
    console.log('\n🗑️  Removendo usuários de teste...');
    
    // Remover dados relacionados primeiro
    for (const user of testUsers) {
      await prisma.transaction.deleteMany({
        where: { userId: user.id }
      });
      
      await prisma.investment.deleteMany({
        where: { userId: user.id }
      });
      
      await prisma.creditCard.deleteMany({
        where: { userId: user.id }
      });
      
      await prisma.note.deleteMany({
        where: { userId: user.id }
      });
    }
    
    const deletedTestUsers = await prisma.user.deleteMany({
      where: {
        id: {
          in: testUsers.map(user => user.id)
        }
      }
    });
    
    console.log(`✅ ${deletedTestUsers.count} usuários de teste removidos com sucesso!`);
    */
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza de dados de teste:', error);
  }
}

// Executar limpeza
async function runCleanup() {
  console.log('🚀 Iniciando processo de limpeza do sistema...\n');
  
  await cleanupInactiveUsers();
  await cleanupTestData();
  
  console.log('\n✅ Processo de limpeza concluído!');
  console.log('💡 Para executar as remoções, descomente as seções apropriadas no script.');
}

runCleanup().catch(console.error);