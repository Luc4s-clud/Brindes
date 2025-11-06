import { prisma } from '../utils/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function checkSetup() {
  console.log('🔍 Verificando configuração do sistema...\n');

  // 1. Verificar variáveis de ambiente
  console.log('1️⃣ Verificando variáveis de ambiente:');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  let envOk = true;

  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ❌ ${varName} não está definida`);
      envOk = false;
    } else {
      console.log(`   ✅ ${varName} está definida`);
      if (varName === 'DATABASE_URL') {
        // Não mostrar a senha completa
        const maskedUrl = value.replace(/:[^:@]+@/, ':****@');
        console.log(`      URL: ${maskedUrl}`);
      }
    }
  });

  if (!envOk) {
    console.log('\n⚠️  Por favor, configure o arquivo .env com as variáveis necessárias.');
    console.log('   Veja ENV_EXAMPLE.txt para referência.\n');
    process.exit(1);
  }

  // 2. Verificar conexão com banco
  console.log('\n2️⃣ Testando conexão com banco de dados:');
  try {
    await prisma.$connect();
    console.log('   ✅ Conexão com banco de dados estabelecida');
    
    // 3. Verificar se a tabela Usuario existe
    console.log('\n3️⃣ Verificando tabela Usuario:');
    const userCount = await prisma.usuario.count();
    console.log(`   ✅ Tabela Usuario encontrada (${userCount} usuários)`);
    
    if (userCount === 0) {
      console.log('\n⚠️  Não há usuários cadastrados no sistema.');
      console.log('   Execute: npm run create:admin para criar um usuário admin.\n');
    } else {
      // 4. Verificar se há usuários com senha hasheada
      console.log('\n4️⃣ Verificando hash de senhas:');
      const usuarios = await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, senha: true },
        take: 5,
      });

      let senhasOk = true;
      usuarios.forEach((usuario) => {
        if (!usuario.senha || !usuario.senha.startsWith('$2')) {
          console.log(`   ❌ Usuário ${usuario.email} não tem senha hasheada`);
          senhasOk = false;
        }
      });

      if (senhasOk) {
        console.log('   ✅ Todas as senhas estão hasheadas corretamente');
      } else {
        console.log('\n⚠️  Alguns usuários têm senhas não hasheadas.');
        console.log('   Isso pode causar erros no login.\n');
      }
    }

    await prisma.$disconnect();
  } catch (error: any) {
    console.log('   ❌ Erro ao conectar com banco de dados');
    console.log(`   Mensagem: ${error.message}`);
    console.log('\n💡 Possíveis soluções:');
    console.log('   - Verifique se o MySQL está rodando');
    console.log('   - Verifique se a DATABASE_URL está correta');
    console.log('   - Execute: npx prisma migrate dev');
    console.log('');
    process.exit(1);
  }

  // 5. Verificar JWT_SECRET
  console.log('\n5️⃣ Verificando JWT_SECRET:');
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret !== 'seu_secret_jwt_aqui') {
    console.log('   ✅ JWT_SECRET está configurado');
  } else {
    console.log('   ⚠️  JWT_SECRET está usando valor padrão (não seguro para produção)');
  }

  console.log('\n✅ Verificação concluída! Sistema parece estar configurado corretamente.\n');
}

checkSetup()
  .catch((error) => {
    console.error('❌ Erro durante verificação:', error);
    process.exit(1);
  });

