# 🚂 Guia de Deploy na Railway

Este guia explica como fazer o deploy do backend na Railway.

## 📋 Pré-requisitos

1. Conta na [Railway](https://railway.app)
2. Repositório Git (GitHub, GitLab, etc.)
3. Banco de dados MySQL (Railway, PlanetScale, ou outro)

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Preparar para deploy Railway"
git push
```

### 2. Criar Projeto no Railway

1. Acesse https://railway.app e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"** (ou GitLab)
4. Selecione seu repositório
5. Railway detectará automaticamente o diretório `backend`

### 3. Adicionar Banco de Dados MySQL

#### Opção A: MySQL na Railway (Recomendado)

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"MySQL"**
3. Railway criará automaticamente e fornecerá a `DATABASE_URL`

#### Opção B: MySQL Externo

Use a URL de conexão do seu provedor:
```
mysql://usuario:senha@host:porta/database
```

### 4. Configurar Variáveis de Ambiente

No Railway, vá em **"Variables"** e adicione:

```env
DATABASE_URL=mysql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://seu-dominio-na-hostinger.com
```

**⚠️ IMPORTANTE:**
- `JWT_SECRET`: Use uma string aleatória e segura (ex: `openssl rand -base64 32`)
- `FRONTEND_URL`: URL completa do seu frontend na Hostinger
- `DATABASE_URL`: Se usar MySQL da Railway, a variável será criada automaticamente

### 5. Executar Migrações

Após o primeiro deploy, você precisa executar as migrações:

#### Opção A: Via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Executar migrações
railway run npx prisma migrate deploy
```

#### Opção B: Via Terminal do Railway

1. No Railway, vá em **"Deployments"**
2. Clique nos três pontos do deployment mais recente
3. Selecione **"View Logs"** ou **"Open Terminal"**
4. Execute: `npx prisma migrate deploy`

### 6. Criar Usuário Admin

Após as migrações, crie o usuário admin:

```bash
railway run npm run create:admin
```

Ou via terminal do Railway.

### 7. Verificar Deploy

1. Acesse a URL fornecida pelo Railway
2. Teste o health check: `https://seu-projeto.railway.app/api/health`
3. Deve retornar: `{"status":"ok","message":"API está funcionando!"}`

## 🔧 Configurar Frontend

Após o deploy do backend, atualize o frontend para usar a API da Railway:

### 1. Criar arquivo `.env.production` no frontend:

```env
VITE_API_URL=https://seu-projeto.railway.app/api
```

### 2. Rebuild do frontend:

```bash
cd frontend
npm run build
```

### 3. Fazer upload do build para a Hostinger

O diretório `dist/` contém os arquivos para upload.

## 📝 Arquivos Criados

Os seguintes arquivos foram criados para facilitar o deploy:

- `backend/railway.json` - Configuração do Railway
- `backend/Procfile` - Comando de start
- `backend/README_RAILWAY.md` - Guia detalhado
- `backend/.env.production.example` - Exemplo de variáveis

## 🔍 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco aceita conexões externas
- Verifique firewall/whitelist do banco

### Erro: "Prisma Client not generated"
- O script `postinstall` no `package.json` gera automaticamente
- Se necessário, execute: `npx prisma generate`

### Erro: "Port already in use"
- Railway define automaticamente a porta via `PORT`
- Não precisa configurar manualmente

### CORS Error
- Verifique se `FRONTEND_URL` está configurado corretamente
- Certifique-se de usar `https://` (não `http://`)

## 🌐 Domínio Personalizado

Para usar um domínio personalizado:

1. No Railway, vá em **"Settings"** → **"Domains"**
2. Clique em **"Custom Domain"**
3. Adicione seu domínio
4. Configure DNS conforme instruções do Railway

## 📊 Monitoramento

- Railway fornece logs em tempo real
- Use o dashboard para monitorar recursos
- Configure alertas se necessário

## 🎯 Checklist Final

- [ ] Backend deployado na Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas
- [ ] Usuário admin criado
- [ ] Health check funcionando
- [ ] Frontend atualizado com URL da API
- [ ] Frontend rebuild e deployado na Hostinger
- [ ] Teste de login funcionando

## 💡 Dicas

1. **Backup**: Configure backups regulares do banco de dados
2. **Logs**: Monitore os logs regularmente no dashboard do Railway
3. **Variáveis**: Use variáveis de ambiente para todas as configurações sensíveis
4. **SSL**: Railway fornece SSL automático (HTTPS)
5. **Escalabilidade**: Railway escala automaticamente conforme necessário

## 📞 Suporte

- Documentação Railway: https://docs.railway.app
- Status: https://status.railway.app

