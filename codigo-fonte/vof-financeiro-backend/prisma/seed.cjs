const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@voffinanceiro.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@voffinanceiro.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado:', admin.email);
  console.log('📧 Email: admin@voffinanceiro.com');
  console.log('🔑 Senha: admin123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Seed concluído com sucesso!');
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });