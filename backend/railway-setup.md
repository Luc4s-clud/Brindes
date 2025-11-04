# Deploy na Railway - Guia de Configuração

## Pré-requisitos

1. Conta na Railway (https://railway.app)
2. Conta em um serviço de MySQL (Railway, PlanetScale, ou outro)
3. Repositório Git configurado

## Passo a Passo

### 1. Preparar o Projeto

O projeto já está configurado com:
- `railway.json` - Configurações do Railway
- `Procfile` - Comando de start
- Scripts de build no `package.json`

### 2. Criar Projeto no Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo" (ou outra opção)
4. Conecte seu repositório
5. Selecione o diretório `backend`

### 3. Adicionar Banco de Dados MySQL

#### Opção A: MySQL na Railway
1. No projeto, clique em "+ New"
2. Selecione "Database" → "MySQL"
3. Railway criará automaticamente e fornecerá a URL de conexão

#### Opção B: MySQL Externo (PlanetScale, etc)
1. Use a URL de conexão do seu provedor MySQL
2. Formato: `mysql://usuario:senha@host:porta/database`

### 4. Configurar Variáveis de Ambiente

No Railway, vá em "Variables" e adicione:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@host:porta/database

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Porta (Railway define automaticamente, mas pode especificar)
PORT=3001

# Ambiente
NODE_ENV=production
```

### 5. Executar Migrações

Após o deploy, você precisa executar as migrações do Prisma:

1. No Railway, vá em "Deployments"
2. Clique nos três pontos do deployment mais recente
3. Selecione "View Logs"
4. Ou use o Railway CLI:

```bash
railway run npx prisma migrate deploy
```

Ou adicione um script no package.json e execute:

```bash
railway run npm run prisma:migrate:deploy
```

### 6. Criar Usuário Admin

Após as migrações, crie o usuário admin:

```bash
railway run npm run create:admin
```

Ou execute manualmente via Railway CLI ou terminal do deployment.

## Comandos Úteis

### Railway CLI (se instalado)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Deploy
railway up

# Ver logs
railway logs

# Executar comando
railway run npx prisma migrate deploy
```

## Verificações

1. ✅ Health check: `https://seu-projeto.railway.app/api/health`
2. ✅ Verificar logs no dashboard do Railway
3. ✅ Testar endpoint de login
4. ✅ Verificar conexão com banco de dados

## Troubleshooting

### Erro de conexão com banco
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco aceita conexões externas
- Verifique firewall/whitelist do banco

### Erro de migrações
- Execute `npx prisma migrate deploy` manualmente
- Verifique se o usuário do banco tem permissões de CREATE

### Porta não encontrada
- Railway usa a variável `PORT` automaticamente
- O Express já está configurado para usar `process.env.PORT`

## Domínio Personalizado

1. No Railway, vá em "Settings" → "Domains"
2. Adicione seu domínio
3. Configure DNS conforme instruções do Railway

## Monitoramento

- Railway fornece logs em tempo real
- Use o dashboard para monitorar CPU, memória e rede
- Configure alertas se necessário

