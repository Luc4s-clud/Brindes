# 📊 Importar Dados no Banco de Dados do Railway

Existem duas formas de importar os dados da planilha Excel para o banco de dados no Railway:

## 🎯 Opção 1: Executar Localmente (Recomendado)

Esta é a forma mais simples e recomendada. Você executa o script localmente, mas ele conecta no banco de dados do Railway.

### Passo 1: Preparar o Ambiente Local

1. **Certifique-se de ter o arquivo Excel:**
   - O arquivo `Planilhas de Gestão de Brindes.xlsx` deve estar na raiz do projeto
   - Mesmo local onde está o `README.md`

2. **Configurar variável de ambiente local:**
   - Crie ou edite o arquivo `backend/.env`
   - Adicione a `DATABASE_URL` do Railway:
     ```env
     DATABASE_URL=mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/railway
     ```
   - **⚠️ IMPORTANTE:** Esta é a URL de conexão do seu banco no Railway

### Passo 2: Executar a Importação

```bash
cd backend
npm run import:excel:completo
```

Este comando vai:
- ✅ Ler o arquivo Excel local
- ✅ Conectar no banco de dados do Railway
- ✅ Importar todos os brindes
- ✅ Importar categorias
- ✅ Importar movimentações (entradas e saídas)
- ✅ Atualizar descrições e fornecedores

### Verificar os Dados

Após a importação, você pode verificar:

1. **Via API:**
   - Acesse: `https://seu-projeto.railway.app/api/brindes`
   - Deve retornar a lista de brindes importados

2. **Via Prisma Studio (localmente):**
   ```bash
   cd backend
   npx prisma studio
   ```
   - Isso abrirá uma interface web em `http://localhost:5555`
   - Você verá todos os dados importados

---

## 🎯 Opção 2: Criar Endpoint de Upload (Avançado)

Se você quiser fazer upload do Excel diretamente pela API, precisamos criar um endpoint. Mas a **Opção 1 é mais simples e recomendada**.

---

## 📋 Checklist de Importação

Antes de importar, certifique-se de:

- [ ] Migrações executadas no Railway (`railway run npx prisma migrate deploy`)
- [ ] Arquivo Excel está na raiz do projeto
- [ ] Arquivo `.env` no backend com a `DATABASE_URL` do Railway
- [ ] Dependências instaladas (`npm install` no backend)

## 🔍 Comandos Disponíveis

### Importação Completa (Recomendado)
```bash
npm run import:excel:completo
```
Importa:
- Brindes principais
- Descrições e fornecedores
- Movimentações de saída
- Movimentações de entrada (eventos)

### Importação Básica
```bash
npm run import:excel
```
Importa apenas a aba principal de brindes.

### Analisar Excel
```bash
npm run analyze:excel
```
Analisa a estrutura do Excel antes de importar.

## ⚠️ Troubleshooting

### Erro: "Cannot connect to database"
- ✅ Verifique se a `DATABASE_URL` está correta no `.env`
- ✅ Certifique-se de que o banco MySQL está rodando no Railway
- ✅ Teste a conexão: `mysql -h nozomi.proxy.rlwy.net -u root -p --port 21718 railway`

### Erro: "File not found"
- ✅ Certifique-se de que o arquivo Excel está na raiz do projeto
- ✅ Verifique o nome do arquivo: `Planilhas de Gestão de Brindes.xlsx`
- ✅ Execute o comando da pasta `backend/`

### Erro: "Migration not applied"
- ✅ Execute primeiro: `railway run npx prisma migrate deploy`
- ✅ Verifique se as tabelas foram criadas

### Dados não aparecem
- ✅ Verifique os logs durante a importação
- ✅ Confirme que não houve erros
- ✅ Use `npx prisma studio` para verificar os dados

## 💡 Dicas

1. **Backup:** Sempre faça backup antes de importar grandes volumes de dados
2. **Teste:** Teste primeiro com alguns registros se possível
3. **Logs:** Monitore os logs durante a importação para identificar problemas
4. **Duplicatas:** O script usa `upsert`, então pode executar múltiplas vezes sem criar duplicatas

## 📝 Próximos Passos Após Importação

1. ✅ Verificar dados importados via API
2. ✅ Criar usuário admin (se ainda não criou): `railway run npm run create:admin`
3. ✅ Testar login no sistema
4. ✅ Verificar se os dados aparecem corretamente no frontend

