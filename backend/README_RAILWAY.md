# 🚂 Deploy na Railway - Guia Rápido

## Configuração Rápida

### 1. Variáveis de Ambiente no Railway

Configure estas variáveis no dashboard do Railway:

```
DATABASE_URL=mysql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 2. Após o Deploy

Execute as migrações do banco:

```bash
railway run npx prisma migrate deploy
```

Ou use o terminal do Railway para executar o comando.

### 3. Criar Usuário Admin

```bash
railway run npm run create:admin
```

Ou via terminal do Railway.

## Estrutura de Arquivos

- `railway.json` - Configuração do Railway
- `Procfile` - Comando de start
- `package.json` - Scripts de build e deploy

## Próximos Passos

1. ✅ Deploy do backend na Railway
2. ✅ Configurar variáveis de ambiente
3. ✅ Executar migrações
4. ✅ Criar usuário admin
5. ✅ Atualizar URL da API no frontend (se necessário)

## URL da API

Após o deploy, você receberá uma URL como:
`https://seu-projeto.railway.app`

Atualize o `baseURL` no frontend se necessário.

