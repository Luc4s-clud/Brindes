# 📊 Guia de Importação da Planilha Excel

Este guia irá ajudá-lo a importar os dados da sua planilha Excel para o banco de dados.

## 📋 Pré-requisitos

1. ✅ MySQL configurado e rodando
2. ✅ Banco de dados `brindes` criado
3. ✅ Arquivo `.env` configurado
4. ✅ Migrações do Prisma executadas

## 🚀 Passo a Passo

### 1. Colocar o arquivo Excel na raiz do projeto

Coloque o arquivo `Planilhas de Gestão de Brindes.xlsx` na raiz do projeto (mesma pasta onde está o README.md).

```
Brindes/
├── Planilhas de Gestão de Brindes.xlsx  ← Coloque aqui
├── backend/
├── frontend/
└── README.md
```

### 2. Instalar dependências

```bash
cd backend
npm install
```

Isso instalará a biblioteca `xlsx` necessária para ler o arquivo Excel.

### 3. Analisar a estrutura do Excel (RECOMENDADO)

Antes de importar, é recomendado analisar a estrutura do Excel para entender quais colunas existem:

```bash
npm run analyze:excel
```

Este comando irá:
- ✅ Listar todas as abas (sheets) do Excel
- ✅ Mostrar todas as colunas encontradas
- ✅ Exibir exemplos de dados
- ✅ Analisar os tipos de dados

**Use essas informações para ajustar o script de importação se necessário.**

### 4. Ajustar o mapeamento (se necessário)

Se as colunas da sua planilha tiverem nomes diferentes dos esperados, edite o arquivo:

`backend/src/scripts/import-excel.ts`

Procure pela função `processSheetData` e ajuste o mapeamento. Por exemplo:

```typescript
const brindeData = {
  nome: row['Nome do Produto'] || row['Nome'] || 'Sem nome',
  descricao: row['Descrição Detalhada'] || row['Descrição'] || null,
  categoria: row['Categoria'] || row['Tipo'] || null,
  quantidade: parseInt(row['Qtd em Estoque'] || row['Quantidade'] || '0') || 0,
  valorUnitario: parseFloat(row['Preço Unitário'] || row['Valor'] || '0') || null,
  fornecedor: row['Fornecedor'] || row['Fabricante'] || null,
};
```

### 5. Executar as migrações (se ainda não executou)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Importar os dados

```bash
npm run import:excel
```

O script irá:
- ✅ Ler todas as abas do Excel
- ✅ Mapear os dados para o modelo do banco
- ✅ Criar/atualizar os brindes
- ✅ Criar categorias automaticamente
- ✅ Mostrar progresso e estatísticas

### 7. Verificar os dados importados

```bash
npx prisma studio
```

Isso abrirá uma interface web onde você pode visualizar todos os dados importados.

## 🔧 Solução de Problemas

### Erro: "Arquivo não encontrado"

**Solução:**
- Verifique se o arquivo está na raiz do projeto
- Verifique se o nome do arquivo está exatamente: `Planilhas de Gestão de Brindes.xlsx`
- Verifique se o caminho está correto

### Erro: "Cannot find module 'xlsx'"

**Solução:**
```bash
cd backend
npm install
```

### Erro: "Column 'nome' não encontrado"

**Solução:**
- Execute primeiro `npm run analyze:excel` para ver as colunas reais
- Ajuste o mapeamento no arquivo `import-excel.ts`
- Verifique os nomes exatos das colunas (case-sensitive)

### Dados não estão sendo importados corretamente

**Solução:**
1. Execute `npm run analyze:excel` para ver a estrutura real
2. Compare com o mapeamento no `import-excel.ts`
3. Ajuste os nomes das colunas no mapeamento
4. Execute novamente `npm run import:excel`

### Erro de conexão com banco de dados

**Solução:**
- Verifique se o MySQL está rodando
- Verifique o arquivo `.env` com as credenciais corretas
- Teste a conexão: `npx prisma db pull`

## 📝 Estrutura Esperada da Planilha

O script espera encontrar colunas similares a estas (case-insensitive):

- **Nome / Produto**: Nome do brinde
- **Descrição**: Descrição do brinde (opcional)
- **Categoria**: Categoria do brinde (opcional)
- **Quantidade / Estoque**: Quantidade em estoque
- **Valor Unitário / Preço / Valor**: Preço unitário (opcional)
- **Fornecedor**: Nome do fornecedor (opcional)

**Se suas colunas tiverem nomes diferentes, ajuste o mapeamento no script.**

## 🎯 Próximos Passos

Após a importação bem-sucedida:

1. ✅ Dados importados no banco
2. ✅ Verificar dados no Prisma Studio
3. ✅ Iniciar o backend: `npm run dev`
4. ✅ Iniciar o frontend: `cd ../frontend && npm run dev`
5. ✅ Acessar a aplicação e ver os dados

## 💡 Dicas

- **Backup**: Faça backup do banco antes de importar grandes volumes
- **Teste**: Teste primeiro com uma pequena amostra de dados
- **Validação**: Use o Prisma Studio para validar os dados importados
- **Atualização**: Você pode executar o script várias vezes (usa upsert, então não duplica)

