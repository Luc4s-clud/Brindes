import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../utils/prisma';

interface ExcelRow {
  [key: string]: any;
}

async function importExcel() {
  try {
    // Caminho do arquivo Excel (ajuste conforme necessário)
    const excelPath = path.join(__dirname, '../../../Planilhas de Gestão de Brindes.xlsx');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ Arquivo não encontrado: ${excelPath}`);
      console.log('\n📋 Por favor, coloque o arquivo Excel na raiz do projeto com o nome:');
      console.log('   "Planilhas de Gestão de Brindes.xlsx"');
      process.exit(1);
    }

    console.log('📖 Lendo arquivo Excel...');
    
    // Ler o arquivo Excel
    const workbook = XLSX.readFile(excelPath);
    
    // Listar todas as abas (sheets)
    console.log('\n📊 Abas encontradas no Excel:');
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`   ${index + 1}. ${sheetName}`);
    });

    // Processar apenas a aba principal de brindes
    const mainSheetName = 'Brindes - Planilha Gerencial 20';
    
    if (!workbook.SheetNames.includes(mainSheetName)) {
      console.error(`❌ Aba principal "${mainSheetName}" não encontrada!`);
      console.log('Abas disponíveis:', workbook.SheetNames.join(', '));
      process.exit(1);
    }

    console.log(`\n🔄 Processando aba principal: "${mainSheetName}"`);
    
    const worksheet = workbook.Sheets[mainSheetName];
    // Ler como array primeiro para ver a estrutura
    const dataArray: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false, 
      defval: null,
      header: 1  // Retorna arrays
    });

    if (dataArray.length < 2) {
      console.error('❌ Planilha não tem dados suficientes');
      process.exit(1);
    }

    // Primeira linha é o cabeçalho, segunda linha pode ser o cabeçalho real ou primeira linha de dados
    // Vamos processar diretamente como arrays usando índices fixos
    
    console.log('   📋 Processando como arrays (usando índices fixos)...');
    console.log(`   📊 Total de linhas: ${dataArray.length}`);
    
    if (dataArray.length > 1) {
      console.log('   📝 Primeira linha (cabeçalho):', dataArray[0].slice(0, 5));
      console.log('   📝 Segunda linha (dados):', dataArray[1].slice(0, 5));
    }

    // Processar a aba principal diretamente como arrays
    await processSheetData(mainSheetName, dataArray);

    console.log('\n✅ Importação concluída!');
    console.log('\n💡 Dica: Execute "npx prisma studio" para visualizar os dados importados.');
    
  } catch (error: any) {
    console.error('\n❌ Erro ao importar Excel:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function processSheetData(sheetName: string, dataArray: any[][]) {
  // Índices das colunas baseado na análise:
  // 0: NO ESTOQUE (Categoria)
  // 1: __EMPTY (Item)
  // 2: __EMPTY_1 (Código Mkt)
  // 3: __EMPTY_2 (Porte)
  // 4: __EMPTY_3 (Valor unitário)
  // 5: __EMPTY_4 (Quantidade consumida)
  // 6: __EMPTY_5 (Última compra)
  // 7: __EMPTY_6 (Do fornecedor)
  // 8: __EMPTY_7 (Estoque atual)
  // 9: __EMPTY_8 (Validade)
  // 10: __EMPTY_9 (Estoque mínimo)
  // 11: __EMPTY_10 (Observações)
  
  const CATEGORIA_IDX = 0;
  const ITEM_IDX = 1;
  const CODIGO_IDX = 2;
  const VALOR_UNITARIO_IDX = 4;
  const FORNECEDOR_IDX = 7;
  const ESTOQUE_ATUAL_IDX = 8;
  const OBSERVACOES_IDX = 11;

  // A linha 0 tem "NO ESTOQUE", a linha 1 tem os nomes dos campos ("Categoria", "Item", etc.)
  // Os dados começam na linha 2 (índice 2)
  const totalRegistros = dataArray.length - 2;
  console.log(`\n   💾 Processando ${totalRegistros} registros (pulando 2 linhas de cabeçalho)...`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  let categoriaAtual = null; // Para manter categoria quando células estão mescladas

  // Processar a partir da linha 3 (índice 2), pulando as 2 linhas de cabeçalho
  for (let idx = 2; idx < dataArray.length; idx++) {
    const row = dataArray[idx];
    
    try {
      // Mapear os dados usando índices fixos
      let categoria = row[CATEGORIA_IDX] || null;
      const item = row[ITEM_IDX] || null;
      const codigo = row[CODIGO_IDX] || null;
      const valorUnitarioStr = row[VALOR_UNITARIO_IDX] || null;
      const estoqueAtual = row[ESTOQUE_ATUAL_IDX] || '0';
      const fornecedor = row[FORNECEDOR_IDX] || null;
      const observacoes = row[OBSERVACOES_IDX] || null;

      // Limpar valores
      if (categoria) categoria = categoria.toString().trim();
      if (categoria && categoria !== 'Categoria' && categoria !== '') {
        categoriaAtual = categoria; // Atualizar categoria atual
      } else if (categoriaAtual) {
        categoria = categoriaAtual; // Usar categoria anterior se célula estiver vazia (mesclada)
      }

      // Debug: mostrar primeiras linhas para análise
      if (idx < 7) {
        console.log(`   🔍 Debug linha ${idx - 1} (índice ${idx}):`, {
          categoria: categoria?.toString().substring(0, 30) || '(vazia)',
          item: item?.toString().substring(0, 30) || '(vazio)',
          codigo: codigo?.toString().substring(0, 20) || '(vazio)',
          estoque: estoqueAtual?.toString() || '0',
        });
      }

      // Validar se tem item (nome do produto)
      const itemStr = item ? item.toString().trim() : '';
      
      // Pular se não tem item ou se é cabeçalho
      if (!itemStr || itemStr === '' || itemStr === 'Item' || itemStr === '__EMPTY') {
        // Debug: mostrar algumas linhas puladas para entender o padrão
        if (skippedCount < 10 && idx < 100) {
          const hasAnyData = categoria || codigo || estoqueAtual || fornecedor || observacoes;
          if (hasAnyData) {
            console.log(`   ⚠️  Linha ${idx - 1} pulada (sem item, mas tem outros dados):`, {
              categoria: categoria?.toString().substring(0, 20),
              item: itemStr || '(vazio)',
              codigo: codigo?.toString().substring(0, 15),
            });
          }
        }
        skippedCount++;
        continue;
      }

      // Limpar e processar valor unitário (remover R$ e converter)
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

      // Processar quantidade de estoque
      const quantidade = parseInt(estoqueAtual?.toString() || '0') || 0;

      // Montar descrição combinando observações e código
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

      // Criar ou atualizar o brinde (usando nome como chave única)
      await prisma.brinde.upsert({
        where: { 
          nome: brindeData.nome 
        },
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

      successCount++;

      // Criar categoria se não existir
      if (brindeData.categoria) {
        await prisma.categoria.upsert({
          where: { nome: brindeData.categoria },
          update: {},
          create: {
            nome: brindeData.categoria,
          },
        });
      }

    } catch (error: any) {
      console.error(`   ❌ Erro ao processar linha:`, row, error.message);
      errorCount++;
    }
  }

  console.log(`\n   ✅ ${successCount} registros importados com sucesso`);
  if (skippedCount > 0) {
    console.log(`   ⏭️  ${skippedCount} registros pulados (sem nome ou linha vazia)`);
    console.log(`   💡 Isso é normal se houver muitas linhas vazias na planilha`);
  }
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} registros com erro`);
  }
  
  // Mostrar estatísticas por categoria
  if (successCount > 0) {
    console.log(`\n   📊 Estatísticas:`);
    console.log(`      Total de brindes importados: ${successCount}`);
    console.log(`      Linhas processadas: ${dataArray.length - 2}`);
    console.log(`      Taxa de sucesso: ${((successCount / (dataArray.length - 2)) * 100).toFixed(1)}%`);
  }
}

// Executar o script
importExcel().catch(console.error);

