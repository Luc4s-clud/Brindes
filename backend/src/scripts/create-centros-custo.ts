import { prisma } from '../utils/prisma';

async function createCentrosCusto() {
  try {
    console.log('🏢 Criando centros de custo de teste...\n');

    // Lista de centros de custo de teste
    const centrosCusto = [
      {
        nome: 'Marketing - Eventos',
        descricao: 'Centro de custo para eventos e feiras',
        orcamentoTotal: 50000.00,
        orcamentoUtilizado: 0,
        limitePorGerente: 10000.00,
        limitePorEvento: 5000.00,
        limitePorSetor: 20000.00,
        setor: 'Marketing',
        ativo: true,
      },
      {
        nome: 'Marketing - Visitas',
        descricao: 'Centro de custo para visitas técnicas e fábricas',
        orcamentoTotal: 30000.00,
        orcamentoUtilizado: 0,
        limitePorGerente: 8000.00,
        limitePorEvento: 3000.00,
        limitePorSetor: 15000.00,
        setor: 'Marketing',
        ativo: true,
      },
      {
        nome: 'Comercial - Expodireto',
        descricao: 'Centro de custo para eventos Expodireto',
        orcamentoTotal: 40000.00,
        orcamentoUtilizado: 0,
        limitePorGerente: 12000.00,
        limitePorEvento: 8000.00,
        limitePorSetor: 25000.00,
        setor: 'Comercial',
        ativo: true,
      },
      {
        nome: 'Suporte Técnico - Treinamentos',
        descricao: 'Centro de custo para treinamentos técnicos',
        orcamentoTotal: 25000.00,
        orcamentoUtilizado: 0,
        limitePorGerente: 6000.00,
        limitePorEvento: 2000.00,
        limitePorSetor: 12000.00,
        setor: 'Suporte Técnico',
        ativo: true,
      },
      {
        nome: 'Uso Interno',
        descricao: 'Centro de custo para uso interno da empresa',
        orcamentoTotal: 20000.00,
        orcamentoUtilizado: 0,
        limitePorGerente: 5000.00,
        limitePorEvento: 1000.00,
        limitePorSetor: 10000.00,
        setor: 'Geral',
        ativo: true,
      },
    ];

    let created = 0;
    let updated = 0;

    for (const centro of centrosCusto) {
      try {
        const resultado = await prisma.centroCusto.upsert({
          where: { nome: centro.nome },
          update: {
            descricao: centro.descricao,
            orcamentoTotal: centro.orcamentoTotal,
            limitePorGerente: centro.limitePorGerente,
            limitePorEvento: centro.limitePorEvento,
            limitePorSetor: centro.limitePorSetor,
            setor: centro.setor,
            ativo: centro.ativo,
          },
          create: centro,
        });

        if (resultado) {
          console.log(`   ✅ ${centro.nome} - ${centro.setor}`);
          created++;
        }
      } catch (error: any) {
        console.error(`   ❌ Erro ao criar ${centro.nome}:`, error.message);
      }
    }

    console.log(`\n✅ ${created} centros de custo criados/atualizados com sucesso!`);
    console.log('\n💡 Dica: Você pode associar um usuário gerente a cada centro de custo depois.');
    
  } catch (error: any) {
    console.error('\n❌ Erro ao criar centros de custo:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
createCentrosCusto().catch(console.error);

