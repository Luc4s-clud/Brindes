import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

async function analyzeExcel() {
  try {
    const excelPath = path.join(__dirname, '../../../Planilhas de Gestão de Brindes.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ Arquivo não encontrado: ${excelPath}`);
      console.log('\n📋 Por favor, coloque o arquivo Excel na raiz do projeto.');
      process.exit(1);
    }

    console.log('📖 Analisando estrutura do arquivo Excel...\n');
    
    const workbook = XLSX.readFile(excelPath);
    
    console.log('📊 Abas encontradas:');
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`   ${index + 1}. ${sheetName}`);
    });

    // Analisar cada aba
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 ABA: "${sheetName}"`);
      console.log('='.repeat(60));
      
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false, 
        defval: null 
      });

      if (data.length === 0) {
        console.log('   ⚠️  Aba vazia');
        continue;
      }

      console.log(`\n📊 Total de linhas: ${data.length}`);
      
      // Identificar colunas
      const columns = Object.keys(data[0]);
      console.log(`\n📝 Colunas encontradas (${columns.length}):`);
      columns.forEach((col, idx) => {
        console.log(`   ${idx + 1}. ${col}`);
      });

      // Mostrar exemplos de dados
      console.log(`\n📄 Primeiras 3 linhas de dados:`);
      data.slice(0, 3).forEach((row, idx) => {
        console.log(`\n   Linha ${idx + 1}:`);
        columns.forEach(col => {
          const value = row[col];
          const displayValue = value !== null && value !== undefined 
            ? String(value).substring(0, 50) 
            : '(vazio)';
          console.log(`      ${col}: ${displayValue}`);
        });
      });

      // Análise de tipos de dados
      console.log(`\n🔍 Análise de tipos de dados:`);
      const columnTypes: { [key: string]: Set<string> } = {};
      columns.forEach(col => {
        columnTypes[col] = new Set();
      });

      data.forEach(row => {
        columns.forEach(col => {
          const value = row[col];
          if (value !== null && value !== undefined) {
            const type = typeof value === 'number' ? 'number' : 
                        !isNaN(Number(value)) && value !== '' ? 'number-like' : 
                        value.toString().includes('@') ? 'email' :
                        value.toString().length > 50 ? 'long-text' :
                        'text';
            columnTypes[col].add(type);
          } else {
            columnTypes[col].add('null');
          }
        });
      });

      columns.forEach(col => {
        const types = Array.from(columnTypes[col]);
        console.log(`   ${col}: ${types.join(', ')}`);
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Análise concluída!');
    console.log('\n💡 Use essas informações para ajustar o mapeamento no script de importação.');
    
  } catch (error: any) {
    console.error('\n❌ Erro ao analisar Excel:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyzeExcel().catch(console.error);

