import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../utils/prisma';

interface ExcelRow {
  [key: string]: any;
}

async function importExcelCompleto() {
  try {
    const excelPath = path.join(__dirname, '../../../Planilhas de Gestão de Brindes.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ Arquivo não encontrado: ${excelPath}`);
      process.exit(1);
    }

    console.log('📖 Lendo arquivo Excel completo...\n');
    
    const workbook = XLSX.readFile(excelPath);
    
    console.log('📊 Abas encontradas:');
    workbook.SheetNames.forEach((name, idx) => {
      console.log(`   ${idx + 1}. ${name}`);
    });

    // 1. Processar aba principal de brindes
    await processarBrindes(workbook);
    
    // 2. Processar descrições e fornecedores
    await processarDescricoesFornecedores(workbook);
    
    // 3. Processar saídas (movimentações)
    await processarSaidas(workbook);
    
    // 4. Processar brindes para eventos (movimentações de entrada)
    await processarBrindesEventos(workbook);

    console.log('\n✅ Importação completa concluída!');
    console.log('\n💡 Execute "npx prisma studio" para visualizar todos os dados.');
    
  } catch (error: any) {
    console.error('\n❌ Erro ao importar Excel:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 1. Processar aba principal de brindes
async function processarBrindes(workbook: XLSX.WorkBook) {
  const sheetName = 'Brindes - Planilha Gerencial 20';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`\n⚠️  Aba "${sheetName}" não encontrada, pulando...`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 PROCESSANDO: ${sheetName}`);
  console.log('='.repeat(60));

  const worksheet = workbook.Sheets[sheetName];
  const dataArray: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false, 
    defval: null,
    header: 1
  });

  const CATEGORIA_IDX = 0;
  const ITEM_IDX = 1;
  const CODIGO_IDX = 2;
  const VALOR_UNITARIO_IDX = 4;
  const FORNECEDOR_IDX = 7;
  const ESTOQUE_ATUAL_IDX = 8;
  const OBSERVACOES_IDX = 11;

  let successCount = 0;
  let skippedCount = 0;
  let categoriaAtual = null;

  for (let idx = 2; idx < dataArray.length; idx++) {
    const row = dataArray[idx];
    
    try {
      let categoria = row[CATEGORIA_IDX] || null;
      const item = row[ITEM_IDX] || null;
      const codigo = row[CODIGO_IDX] || null;
      const valorUnitarioStr = row[VALOR_UNITARIO_IDX] || null;
      const estoqueAtual = row[ESTOQUE_ATUAL_IDX] || '0';
      const fornecedor = row[FORNECEDOR_IDX] || null;
      const observacoes = row[OBSERVACOES_IDX] || null;

      if (categoria) categoria = categoria.toString().trim();
      if (categoria && categoria !== 'Categoria' && categoria !== '') {
        categoriaAtual = categoria;
      } else if (categoriaAtual) {
        categoria = categoriaAtual;
      }

      const itemStr = item ? item.toString().trim() : '';
      if (!itemStr || itemStr === '' || itemStr === 'Item' || itemStr === '__EMPTY') {
        skippedCount++;
        continue;
      }

      let valorUnitario: number | null = null;
      if (valorUnitarioStr) {
        const valorLimpo = valorUnitarioStr.toString()
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim();
        const valorNum = parseFloat(valorLimpo);
        if (!isNaN(valorNum)) {
          valorUnitario = valorNum;
        }
      }

      const quantidade = parseInt(estoqueAtual?.toString() || '0') || 0;
      const descricao = observacoes 
        ? `${codigo ? `Código: ${codigo}. ` : ''}${observacoes}`
        : (codigo ? `Código: ${codigo}` : null);

      const brindeData = {
        nome: itemStr,
        codigo: codigo?.toString().trim() || null,
        descricao: descricao,
        categoria: categoria || null,
        quantidade: quantidade,
        valorUnitario: valorUnitario,
        fornecedor: fornecedor?.toString().trim() || null,
      };

      await prisma.brinde.upsert({
        where: { nome: brindeData.nome },
        update: {
          codigo: brindeData.codigo,
          descricao: brindeData.descricao,
          categoria: brindeData.categoria,
          quantidade: brindeData.quantidade,
          valorUnitario: brindeData.valorUnitario,
          fornecedor: brindeData.fornecedor,
        },
        create: brindeData,
      });

      if (brindeData.categoria) {
        await prisma.categoria.upsert({
          where: { nome: brindeData.categoria },
          update: {},
          create: { nome: brindeData.categoria },
        });
      }

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Erro linha ${idx}:`, error.message);
    }
  }

  console.log(`   ✅ ${successCount} brindes importados`);
  console.log(`   ⏭️  ${skippedCount} linhas puladas`);
}

// 2. Processar descrições e fornecedores (atualizar brindes existentes)
async function processarDescricoesFornecedores(workbook: XLSX.WorkBook) {
  const sheetName = 'Descrições e Fornecedores';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`\n⚠️  Aba "${sheetName}" não encontrada, pulando...`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 PROCESSANDO: ${sheetName}`);
  console.log('='.repeat(60));

  const worksheet = workbook.Sheets[sheetName];
  const dataArray: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false, 
    defval: null,
    header: 1
  });

  const CATEGORIA_IDX = 0;
  const ITEM_IDX = 1;
  const CODIGO_IDX = 2;
  const DESCRICAO_OPCAO1_IDX = 4;
  const DESCRICAO_VARIACAO_IDX = 5;
  const FORNECEDORES_PRINCIPAIS_IDX = 6;
  const FORNECEDORES_OUTROS_IDX = 7;
  const VALOR_ULTIMO_IDX = 8;
  const VALOR_PENULTIMO_IDX = 9;

  let successCount = 0;
  let categoriaAtual = null;

  for (let idx = 2; idx < dataArray.length; idx++) {
    const row = dataArray[idx];
    
    try {
      let categoria = row[CATEGORIA_IDX] || null;
      const item = row[ITEM_IDX] || null;
      const codigo = row[CODIGO_IDX] || null;
      const descricao1 = row[DESCRICAO_OPCAO1_IDX] || null;
      const descricaoVariacao = row[DESCRICAO_VARIACAO_IDX] || null;
      const fornecedoresPrincipais = row[FORNECEDORES_PRINCIPAIS_IDX] || null;
      const fornecedoresOutros = row[FORNECEDORES_OUTROS_IDX] || null;
      const valorUltimo = row[VALOR_ULTIMO_IDX] || null;
      const valorPenultimo = row[VALOR_PENULTIMO_IDX] || null;

      if (categoria) categoria = categoria.toString().trim();
      if (categoria && categoria !== 'Categoria' && categoria !== '') {
        categoriaAtual = categoria;
      } else if (categoriaAtual) {
        categoria = categoriaAtual;
      }

      const itemStr = item ? item.toString().trim() : '';
      if (!itemStr || itemStr === '' || itemStr === 'Item') {
        continue;
      }

      // Buscar brinde por nome ou código
      const brinde = await prisma.brinde.findFirst({
        where: {
          OR: [
            { nome: { contains: itemStr } },
            { codigo: codigo?.toString().trim() || undefined },
          ]
        }
      });

      if (!brinde) {
        continue; // Brinde não encontrado, pular
      }

      // Montar descrição completa
      let descricaoCompleta = brinde.descricao || '';
      if (descricao1) {
        descricaoCompleta += (descricaoCompleta ? '\n\n' : '') + `Descrição: ${descricao1}`;
      }
      if (descricaoVariacao) {
        descricaoCompleta += (descricaoCompleta ? '\n' : '') + `Variação: ${descricaoVariacao}`;
      }

      // Atualizar fornecedor (combinar principais e outros)
      let fornecedorCompleto = brinde.fornecedor || '';
      if (fornecedoresPrincipais) {
        fornecedorCompleto = fornecedoresPrincipais.toString();
      }
      if (fornecedoresOutros) {
        fornecedorCompleto += (fornecedorCompleto ? '; ' : '') + fornecedoresOutros.toString();
      }

      // Processar valores
      let valorUnitario = brinde.valorUnitario;
      if (valorUltimo) {
        const valorLimpo = valorUltimo.toString()
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim();
        const valorNum = parseFloat(valorLimpo);
        if (!isNaN(valorNum)) {
          valorUnitario = valorNum;
        }
      }

      await prisma.brinde.update({
        where: { id: brinde.id },
        data: {
          descricao: descricaoCompleta || brinde.descricao,
          fornecedor: fornecedorCompleto || brinde.fornecedor,
          valorUnitario: valorUnitario,
        },
      });

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Erro linha ${idx}:`, error.message);
    }
  }

  console.log(`   ✅ ${successCount} brindes atualizados`);
}

// 3. Processar saídas (criar movimentações de saída)
async function processarSaidas(workbook: XLSX.WorkBook) {
  const sheetName = 'Saídas';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`\n⚠️  Aba "${sheetName}" não encontrada, pulando...`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📤 PROCESSANDO: ${sheetName}`);
  console.log('='.repeat(60));

  const worksheet = workbook.Sheets[sheetName];
  const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false, 
    defval: null
  });

  let successCount = 0;
  let errorCount = 0;

  for (const row of data) {
    try {
      const codigo = row['CÓD'] || row['Código'] || null;
      const item = row['ITEM'] || row['Item'] || null;
      const quantidade = parseInt(row['QUANTIDADE'] || row['Quantidade'] || '0') || 0;
      const motivo = row['MOTIVO'] || row['Motivo'] || null;
      const agente = row['AGENTE'] || row['Agente'] || null;
      const regiao = row['REGIÃO'] || row['Região'] || null;
      const mes = row['MÊS'] || row['Mês'] || null;
      const ano = row['ANO'] || row['Ano'] || null;

      if (!codigo && !item) continue;
      if (quantidade <= 0) continue;

      // Buscar brinde por código ou nome
      const brinde = await prisma.brinde.findFirst({
        where: {
          OR: [
            { codigo: codigo?.toString().trim() },
            { nome: { contains: item?.toString().trim() || '' } },
          ]
        }
      });

      if (!brinde) {
        continue; // Brinde não encontrado
      }

      // Montar observação com detalhes
      const observacao = [
        agente ? `Agente: ${agente}` : null,
        regiao ? `Região: ${regiao}` : null,
        mes ? `Mês: ${mes}` : null,
        ano ? `Ano: ${ano}` : null,
      ].filter(Boolean).join('; ');

      // Criar movimentação de saída
      await prisma.$transaction(async (tx) => {
        // Verificar estoque
        if (brinde.quantidade < quantidade) {
          console.log(`   ⚠️  Estoque insuficiente para ${brinde.nome}: ${brinde.quantidade} < ${quantidade}`);
        }

        const movimentacao = await tx.movimentacao.create({
          data: {
            brindeId: brinde.id,
            tipo: 'SAIDA',
            quantidade: quantidade,
            motivo: motivo?.toString() || 'Saída registrada',
            observacao: observacao || null,
            createdAt: new Date(`${ano || new Date().getFullYear()}-${mes ? mes.split(' - ')[0].padStart(2, '0') : '01'}-01`),
          },
        });

        // Atualizar estoque
        await tx.brinde.update({
          where: { id: brinde.id },
          data: {
            quantidade: Math.max(0, brinde.quantidade - quantidade),
          },
        });
      });

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Erro ao processar saída:`, error.message);
      errorCount++;
    }
  }

  console.log(`   ✅ ${successCount} movimentações de saída criadas`);
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} erros`);
  }
}

// 4. Processar brindes para eventos (movimentações de entrada)
async function processarBrindesEventos(workbook: XLSX.WorkBook) {
  const sheetName = 'Brindes para Eventos';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`\n⚠️  Aba "${sheetName}" não encontrada, pulando...`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎪 PROCESSANDO: ${sheetName}`);
  console.log('='.repeat(60));

  const worksheet = workbook.Sheets[sheetName];
  const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false, 
    defval: null
  });

  let successCount = 0;
  let errorCount = 0;

  for (const row of data) {
    try {
      const codigo = row['CÓD'] || row['Código'] || null;
      const item = row['ITEM'] || row['Item'] || null;
      const quantidade = parseInt(row['QUANTIDADE'] || row['Quantidade'] || '0') || 0;
      const evento = row['EVENTO'] || row['Evento'] || null;
      const ano = row['ANO'] || row['Ano'] || null;
      const custoUnd = row['CUSTO UND'] || row['Custo Und'] || null;

      if (!codigo && !item) continue;
      if (quantidade <= 0) continue;

      const brinde = await prisma.brinde.findFirst({
        where: {
          OR: [
            { codigo: codigo?.toString().trim() },
            { nome: { contains: item?.toString().trim() || '' } },
          ]
        }
      });

      if (!brinde) {
        continue;
      }

      // Processar custo unitário
      let valorUnitario = brinde.valorUnitario;
      if (custoUnd) {
        const valorLimpo = custoUnd.toString()
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim();
        const valorNum = parseFloat(valorLimpo);
        if (!isNaN(valorNum)) {
          valorUnitario = valorNum;
        }
      }

      // Atualizar valor unitário se necessário
      if (valorUnitario && valorUnitario !== brinde.valorUnitario) {
        await prisma.brinde.update({
          where: { id: brinde.id },
          data: { valorUnitario: valorUnitario },
        });
      }

      // Criar movimentação de entrada
      await prisma.$transaction(async (tx) => {
        const movimentacao = await tx.movimentacao.create({
          data: {
            brindeId: brinde.id,
            tipo: 'ENTRADA',
            quantidade: quantidade,
            motivo: evento ? `Evento: ${evento}` : 'Entrada para evento',
            observacao: ano ? `Ano: ${ano}` : null,
            createdAt: new Date(`${ano || new Date().getFullYear()}-01-01`),
          },
        });

        await tx.brinde.update({
          where: { id: brinde.id },
          data: {
            quantidade: brinde.quantidade + quantidade,
          },
        });
      });

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Erro ao processar evento:`, error.message);
      errorCount++;
    }
  }

  console.log(`   ✅ ${successCount} movimentações de entrada criadas`);
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} erros`);
  }
}

// Executar o script
importExcelCompleto().catch(console.error);

