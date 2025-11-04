# 🚀 Como Executar Comandos no Railway

## Método 1: Via Railway CLI (Recomendado)

### Passo 1: Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### Passo 2: Fazer Login

```bash
railway login
```

Isso abrirá o navegador para você fazer login na Railway.

### Passo 3: Linkar ao Projeto

```bash
cd backend
railway link
```

Isso vai pedir para você selecionar o projeto no Railway.

### Passo 4: Executar o Comando

```bash
railway run npx prisma migrate deploy
```

**Pronto!** O comando será executado no ambiente do Railway.

---

## Método 2: Via Terminal do Railway (Mais Simples)

Se você não quer instalar o CLI, pode usar o terminal web do Railway:

### Passo 1: Acessar o Terminal

1. **No dashboard do Railway:**
   - Acesse seu projeto
   - Clique no serviço do **backend**
   - Vá até a aba **"Deployments"**
   - Clique nos **três pontos** (⋯) do deployment mais recente
   - Selecione **"Open Terminal"** ou **"View Logs"**

2. **Ou diretamente:**
   - No serviço do backend, procure por **"Terminal"** ou **"Shell"**
   - Clique para abrir o terminal web

### Passo 2: Executar o Comando

No terminal que abriu, digite:

```bash
npx prisma migrate deploy
```

**Pronto!** O comando será executado diretamente no ambiente do Railway.

---

## 📋 Comandos Úteis

### Executar Migrações
```bash
railway run npx prisma migrate deploy
# ou no terminal do Railway:
npx prisma migrate deploy
```

### Criar Usuário Admin
```bash
railway run npm run create:admin
# ou no terminal do Railway:
npm run create:admin
```

### Verificar Status do Prisma
```bash
railway run npx prisma migrate status
# ou no terminal do Railway:
npx prisma migrate status
```

### Gerar Prisma Client (se necessário)
```bash
railway run npx prisma generate
# ou no terminal do Railway:
npx prisma generate
```

---

## 🔍 Verificar se Funcionou

Após executar `npx prisma migrate deploy`, você deve ver algo como:

```
✅ Applied migration: 20251104114307_init
✅ Applied migration: 20251104115421_add_codigo_field
✅ Applied migration: 20251104124301_sistema_completo
```

Se aparecer mensagens de erro, verifique:
- ✅ Se a `DATABASE_URL` está configurada corretamente
- ✅ Se o banco de dados existe
- ✅ Se o usuário tem permissões para criar tabelas

---

## 💡 Dica

O **Método 2 (Terminal Web)** é mais simples se você:
- Não quer instalar o Railway CLI
- Quer executar comandos rapidamente
- Está apenas testando

O **Método 1 (Railway CLI)** é melhor se você:
- Vai executar comandos frequentemente
- Quer automatizar processos
- Prefere trabalhar no terminal local

---

## ❓ Troubleshooting

### Erro: "railway: command not found"
- Instale o Railway CLI: `npm install -g @railway/cli`
- Ou use o Método 2 (Terminal Web)

### Erro: "Not logged in"
- Execute: `railway login`
- Ou use o Método 2 (Terminal Web)

### Erro: "Project not linked"
- Execute: `railway link`
- Ou use o Método 2 (Terminal Web)

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está configurada no Railway
- Confirme que o banco MySQL está rodando

