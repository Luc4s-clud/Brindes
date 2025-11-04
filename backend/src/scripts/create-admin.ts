import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    const email = process.argv[2] || 'admin@brindes.com';
    const senha = process.argv[3] || 'admin123';
    const nome = process.argv[4] || 'Administrador';

    console.log('🔐 Criando usuário administrador...\n');

    // Verificar se já existe
    const existe = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existe) {
      console.log(`⚠️  Usuário com email ${email} já existe!`);
      console.log('   Use outro email ou exclua o usuário existente primeiro.\n');
      process.exit(1);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: 'MARKETING',
        ativo: true,
      },
    });

    console.log('✅ Usuário administrador criado com sucesso!\n');
    console.log('📋 Dados de acesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha}`);
    console.log(`   Perfil: ${usuario.perfil}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

  } catch (error: any) {
    console.error('\n❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin().catch(console.error);

