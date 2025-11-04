# 🔄 Alterar Nome do Banco de "railway" para "brindes" no Railway

## 📋 Passo a Passo

### Passo 1: Conectar ao MySQL da Railway

Você pode fazer isso de duas formas:

#### Opção A: Via Railway CLI (Recomendado)

```bash
railway connect MySQL
```

Isso abrirá uma conexão direta com o banco MySQL.

#### Opção B: Via MySQL Client Local

```bash
mysql -h nozomi.proxy.rlwy.net -u root -p AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu --port 21718 --protocol=TCP railway
```

### Passo 2: Criar o Novo Banco de Dados "brindes"

Após conectar, execute os seguintes comandos SQL:

```sql
-- Criar o novo banco de dados
CREATE DATABASE brindes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar se foi criado
SHOW DATABASES;
```

### Passo 3: Migrar os Dados (se já houver dados no banco "railway")

Se você já tem dados no banco "railway", você precisa migrá-los:

```sql
-- Conectar ao banco railway
USE railway;

-- Exportar estrutura e dados (você pode fazer isso via mysqldump ou copiar manualmente)
-- Se não tiver dados ainda, pode pular esta etapa
```

**Se você ainda não importou dados**, pode pular esta etapa e ir direto para o Passo 4.

**Se você já tem dados**, você pode:

1. **Usar mysqldump (recomendado):**
   ```bash
   mysqldump -h nozomi.proxy.rlwy.net -u root -p --port 21718 railway > backup.sql
   mysql -h nozomi.proxy.rlwy.net -u root -p --port 21718 brindes < backup.sql
   ```

2. **Ou executar as migrações novamente no novo banco:**
   - Atualize a DATABASE_URL primeiro (Passo 4)
   - Execute: `railway run npx prisma migrate deploy`

### Passo 4: Atualizar a DATABASE_URL no Railway

1. **No dashboard do Railway:**
   - Vá até o serviço do **backend**
   - Clique na aba **"Variables"**
   - Encontre a variável `DATABASE_URL`
   - Edite o valor e altere o nome do banco de `railway` para `brindes`:

   **Antes:**
   ```
   mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/railway
   ```

   **Depois:**
   ```
   mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/brindes
   ```

2. **Salve a alteração**

3. **O Railway fará um novo deploy automaticamente** (ou você pode fazer um redeploy manual)

### Passo 5: Executar Migrações no Novo Banco

Após atualizar a DATABASE_URL, execute as migrações no novo banco:

```bash
railway run npx prisma migrate deploy
```

### Passo 6: Verificar se Está Funcionando

1. **Teste a conexão:**
   - Acesse: `https://seu-projeto.railway.app/api/health`
   - Deve retornar: `{"status":"ok","message":"API está funcionando!"}`

2. **Verificar banco de dados:**
   ```sql
   USE brindes;
   SHOW TABLES;
   ```
   
   Deve mostrar as tabelas:
   - brindes
   - categorias
   - usuarios
   - movimentacoes
   - etc.

### Passo 7: Importar Dados (se necessário)

Se você ainda não importou os dados do Excel, agora pode fazer:

```bash
cd backend
# Certifique-se de que o .env tem a nova DATABASE_URL
npm run import:excel:completo
```

---

## ⚠️ Se Você Já Tem Dados Importados

Se você já importou dados no banco "railway" e quer migrá-los para "brindes":

### Método 1: Via mysqldump (Recomendado)

```bash
# 1. Fazer backup do banco railway
mysqldump -h nozomi.proxy.rlwy.net -u root -pAZAFgkKlfQlHKkhXIklKaYaaSDqOngdu --port 21718 railway > backup_railway.sql

# 2. Importar no banco brindes
mysql -h nozomi.proxy.rlwy.net -u root -pAZAFgkKlfQlHKkhXIklKaYaaSDqOngdu --port 21718 brindes < backup_railway.sql
```

### Método 2: Via SQL Direto

```sql
-- Conectar ao banco railway
USE railway;

-- Copiar todas as tabelas (exemplo)
CREATE TABLE brindes.brindes AS SELECT * FROM railway.brindes;
CREATE TABLE brindes.categorias AS SELECT * FROM railway.categorias;
-- ... (repetir para todas as tabelas)
```

**⚠️ NOTA:** O método 2 é mais trabalhoso. Recomendo usar mysqldump.

---

## 🔍 Verificação Final

Após tudo configurado, verifique:

- [ ] Banco "brindes" criado no MySQL
- [ ] DATABASE_URL atualizada no Railway (backend)
- [ ] Migrações executadas no novo banco
- [ ] Health check funcionando
- [ ] Dados importados (se necessário)

---

## 💡 Dica

Se você ainda não importou dados, é mais simples:
1. Criar o banco "brindes"
2. Atualizar DATABASE_URL
3. Executar migrações
4. Importar dados do Excel

Isso evita a necessidade de migrar dados de um banco para outro.

---

## ❓ Troubleshooting

### Erro: "Access denied"
- Verifique se está usando as credenciais corretas
- Confirme que o usuário tem permissões para criar bancos de dados

### Erro: "Database already exists"
- O banco "brindes" já existe? Você pode usar `DROP DATABASE brindes;` (cuidado: apaga tudo!)
- Ou simplesmente use o banco existente

### Erro na conexão após mudança
- Verifique se a DATABASE_URL está correta
- Confirme que o Railway fez o redeploy
- Verifique os logs do Railway para erros específicos

