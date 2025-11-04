# 🗄️ Configurar Banco de Dados no Railway

## Passo 1: Adicionar MySQL no Railway

1. **No dashboard do Railway:**
   - Acesse seu projeto
   - Clique em **"+ New"** (ou **"+ Add Service"**)
   - Selecione **"Database"** → **"MySQL"**
   - Railway criará automaticamente o banco MySQL

2. **Railway criará automaticamente:**
   - Um serviço MySQL
   - A variável de ambiente `DATABASE_URL` (será adicionada automaticamente)

## Passo 2: Configurar DATABASE_URL Manualmente

**⚠️ IMPORTANTE:** Às vezes o Railway não cria a variável `DATABASE_URL` automaticamente. Você precisa adicioná-la manualmente:

### Como Adicionar a Variável no Railway:

1. **No dashboard do Railway:**
   - Vá até o serviço do **backend** (não do MySQL)
   - Clique na aba **"Variables"** (ou **"Variables & Secrets"**)
   - Clique em **"+ New Variable"** ou **"+ Add Variable"**

2. **Adicione a variável:**
   - **Nome:** `DATABASE_URL`
   - **Valor:** Cole a URL completa do MySQL:
     ```
     mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/railway
     ```
   - Clique em **"Add"** ou **"Save"**

3. **Verificar se foi adicionada:**
   - A variável deve aparecer na lista de variáveis
   - Certifique-se de que está no serviço do **backend**, não no MySQL

### Outras Variáveis Necessárias

No mesmo lugar, adicione também:

```env
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://seu-dominio-frontend.com
```

**💡 Dicas:**
- `JWT_SECRET`: Gere uma chave segura (exemplo: `openssl rand -base64 32`)
- `FRONTEND_URL`: URL completa do seu frontend (ex: `https://seusite.com`)
- `DATABASE_URL`: Use a URL completa que você recebeu do MySQL

## Passo 3: Executar Migrações

Após o deploy estar funcionando, você precisa executar as migrações para criar as tabelas no banco.

### Opção A: Via Railway CLI (Recomendado)

```bash
# Instalar Railway CLI (se ainda não tiver)
npm i -g @railway/cli

# Login
railway login

# Linkar ao projeto (se ainda não linkou)
cd backend
railway link

# Executar migrações
railway run npx prisma migrate deploy
```

### Opção B: Via Terminal do Railway

1. No Railway, vá até o serviço do **backend**
2. Clique em **"Deployments"**
3. Clique nos **três pontos** do deployment mais recente
4. Selecione **"Open Terminal"** ou **"View Logs"**
5. Execute:
   ```bash
   npx prisma migrate deploy
   ```

**✅ Verificação:** Se tudo estiver certo, você verá mensagens como:
```
✅ Applied migration: 20251104114307_init
✅ Applied migration: 20251104115421_add_codigo_field
✅ Applied migration: 20251104124301_sistema_completo
```

## Passo 4: Criar Usuário Admin

Após as migrações, crie o primeiro usuário administrador:

### Via Railway CLI:
```bash
railway run npm run create:admin
```

### Via Terminal do Railway:
1. No terminal do deployment (mesmo processo do passo 3)
2. Execute:
   ```bash
   npm run create:admin
   ```

O script vai pedir:
- **Nome:** Nome do administrador
- **Email:** Email para login
- **Senha:** Senha do administrador

## Passo 5: Verificar se Está Funcionando

1. **Health Check:**
   - Acesse: `https://seu-projeto.railway.app/api/health`
   - Deve retornar: `{"status":"ok","message":"API está funcionando!"}`

2. **Testar Login:**
   - Faça uma requisição POST para: `https://seu-projeto.railway.app/api/auth/login`
   - Com os dados do admin criado
   - Deve retornar um token JWT

## 🔍 Troubleshooting

### Erro: "Cannot connect to database"
- ✅ Verifique se a `DATABASE_URL` está configurada no serviço do backend
- ✅ Confirme que o serviço MySQL está rodando no Railway
- ✅ Verifique se há erros nos logs do MySQL

### Erro: "Prisma Client not generated"
- ✅ O `postinstall` já executa `prisma generate` automaticamente
- ✅ Se necessário, execute manualmente: `railway run npx prisma generate`

### Erro nas Migrações: "User does not have permission"
- ✅ Verifique se o usuário do banco tem permissões de CREATE
- ✅ Se usar MySQL externo, certifique-se que o usuário tem todas as permissões

### Erro: "Migration failed"
- ✅ Verifique os logs do Railway para ver o erro específico
- ✅ Certifique-se de que não há migrações conflitantes
- ✅ Se necessário, reset o banco (cuidado: apaga todos os dados!)

## 📋 Checklist Final

- [ ] MySQL criado no Railway
- [ ] `DATABASE_URL` configurada (automático se MySQL da Railway)
- [ ] `JWT_SECRET` configurada
- [ ] `JWT_EXPIRES_IN` configurada
- [ ] `NODE_ENV=production` configurada
- [ ] `FRONTEND_URL` configurada
- [ ] Migrações executadas com sucesso
- [ ] Usuário admin criado
- [ ] Health check funcionando
- [ ] Login testado e funcionando

## 💡 Dicas

1. **Backup:** Configure backups regulares do banco de dados no Railway
2. **Logs:** Monitore os logs regularmente para identificar problemas
3. **Variáveis:** Use variáveis de ambiente para todas as configurações sensíveis
4. **Conexão:** O Railway gerencia a conexão automaticamente, não precisa configurar firewall

