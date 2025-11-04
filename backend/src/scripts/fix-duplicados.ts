import { prisma } from '../utils/prisma';

async function fixDuplicados() {
  try {
    console.log('🔍 Verificando códigos duplicados...\n');

    // Buscar todos os brindes
    const brindes = await prisma.brinde.findMany({
      orderBy: { codigo: 'asc' },
    });

    // Agrupar por código
    const codigosMap = new Map<string, any[]>();
    
    brindes.forEach(brinde => {
      if (brinde.codigo) {
        if (!codigosMap.has(brinde.codigo)) {
          codigosMap.set(brinde.codigo, []);
        }
        codigosMap.get(brinde.codigo)!.push(brinde);
      }
    });

    // Encontrar duplicatas
    const duplicados: { codigo: string; brindes: any[] }[] = [];
    
    codigosMap.forEach((brindesList, codigo) => {
      if (brindesList.length > 1) {
        duplicados.push({ codigo, brindes: brindesList });
      }
    });

    if (duplicados.length === 0) {
      console.log('✅ Nenhum código duplicado encontrado!');
      return;
    }

    console.log(`⚠️  Encontrados ${duplicados.length} códigos duplicados:\n`);

    // Mostrar duplicatas
    for (const dup of duplicados) {
      console.log(`📋 Código: ${dup.codigo} (${dup.brindes.length} brindes)`);
      dup.brindes.forEach((b, idx) => {
        console.log(`   ${idx + 1}. ID ${b.id}: ${b.nome} (Quantidade: ${b.quantidade})`);
      });
      console.log('');
    }

    // Resolver duplicatas
    console.log('🔧 Resolvendo duplicatas...\n');

    for (const dup of duplicados) {
      // Manter o primeiro e adicionar sufixo nos outros
      const [primeiro, ...restantes] = dup.brindes;
      
      console.log(`   ✅ Mantendo código "${dup.codigo}" para: ${primeiro.nome}`);
      
      for (let i = 0; i < restantes.length; i++) {
        const brinde = restantes[i];
        const novoCodigo = `${dup.codigo}-${i + 1}`;
        
        await prisma.brinde.update({
          where: { id: brinde.id },
          data: { codigo: novoCodigo },
        });
        
        console.log(`   🔄 Alterado código de "${brinde.nome}" para "${novoCodigo}"`);
      }
    }

    console.log('\n✅ Duplicatas resolvidas!');
    console.log('\n💡 Agora você pode executar a migração novamente:');
    console.log('   npx prisma migrate dev --name sistema_completo');

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicados().catch(console.error);

