# 🔧 Como Corrigir o Erro "Could not find root directory: backend"

## Problema

O Railway está procurando o diretório `backend` como diretório raiz, mas não consegue encontrá-lo durante o processo de snapshot do código.

## Soluções

### Solução 1: Configurar Root Directory no Dashboard do Railway (RECOMENDADO)

1. Acesse o dashboard do Railway: https://railway.app
2. Selecione seu projeto
3. Clique no serviço que está falhando
4. Vá em **Settings** (Configurações)
5. Role até a seção **"Root Directory"**
6. Defina o Root Directory como: `backend`
7. Salve as alterações
8. O Railway fará um novo deploy automaticamente

### Solução 2: Recriar o Serviço com Configuração Correta

Se a Solução 1 não funcionar:

1. No dashboard do Railway, delete o serviço atual
2. Clique em **"+ New"** → **"GitHub Repo"**
3. Selecione seu repositório
4. **IMPORTANTE**: Após o Railway criar o serviço, vá em **Settings** → **Root Directory**
5. Defina como: `backend`
6. O Railway fará o deploy automaticamente

### Solução 3: Verificar Estrutura do Repositório

Certifique-se de que o repositório no GitHub tem a estrutura correta:

```
seu-repositorio/
├── backend/
│   ├── package.json
│   ├── railway.json
│   ├── Procfile
│   └── ...
├── frontend/
└── README.md
```

### Verificação

Após aplicar a correção, verifique:

1. ✅ O deployment deve passar da fase "Snapshot code"
2. ✅ Deve iniciar a fase "Build"
3. ✅ Deve completar o deploy com sucesso
4. ✅ Acesse: `https://seu-projeto.railway.app/api/health`

## Próximos Passos Após o Deploy Bem-Sucedido

1. **Configurar Variáveis de Ambiente**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV=production`
   - `FRONTEND_URL`

2. **Executar Migrações**:
   ```bash
   railway run npx prisma migrate deploy
   ```

3. **Criar Usuário Admin**:
   ```bash
   railway run npm run create:admin
   ```

## Troubleshooting Adicional

### Se ainda não funcionar:

1. Verifique se o arquivo `backend/package.json` existe no repositório
2. Verifique se o arquivo `backend/railway.json` existe
3. Verifique se o arquivo `backend/Procfile` existe
4. Certifique-se de que todos os arquivos estão commitados e enviados para o GitHub:
   ```bash
   git add .
   git commit -m "Corrigir estrutura para Railway"
   git push
   ```

