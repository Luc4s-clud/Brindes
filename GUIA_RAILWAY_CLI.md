# 🖥️ Guia Completo: Railway CLI

## 📦 Passo 1: Instalar Railway CLI

Abra o terminal (PowerShell, CMD ou Git Bash) e execute:

```bash
npm install -g @railway/cli
```

**Verificar se foi instalado:**
```bash
railway --version
```

Se aparecer a versão, está instalado corretamente!

---

## 🔐 Passo 2: Fazer Login

Execute:

```bash
railway login
```

Isso vai:
1. Abrir seu navegador automaticamente
2. Pedir para você fazer login na Railway
3. Autorizar o CLI a acessar sua conta

**✅ Você verá:** "Successfully logged in!"

---

## 🔗 Passo 3: Navegar até o Projeto

```bash
cd backend
```

Você precisa estar na pasta do backend para executar os comandos.

---

## 🎯 Passo 4: Linkar ao Projeto do Railway

```bash
railway link
```

Isso vai mostrar uma lista de seus projetos. Escolha o projeto "Brindes" (ou o nome do seu projeto).

**✅ Você verá:** "Linked to [nome-do-projeto]"

---

## 🚀 Passo 5: Executar Comandos

Agora você pode executar comandos no ambiente do Railway:

### Executar Migrações
```bash
railway run npx prisma migrate deploy
```

### Criar Usuário Admin
```bash
railway run npm run create:admin
```

### Gerar Prisma Client
```bash
railway run npx prisma generate
```

### Qualquer comando npm
```bash
railway run npm run [nome-do-script]
```

---

## 📋 Comandos Úteis do Railway CLI

### Ver Status do Projeto
```bash
railway status
```

### Ver Logs em Tempo Real
```bash
railway logs
```

### Ver Variáveis de Ambiente
```bash
railway variables
```

### Adicionar Variável de Ambiente
```bash
railway variables set NOME_VARIAVEL=valor
```

### Abrir Dashboard no Navegador
```bash
railway open
```

### Deslinkar do Projeto
```bash
railway unlink
```

---

## 🔍 Exemplo Completo: Executar Migrações

```bash
# 1. Instalar CLI (só uma vez)
npm install -g @railway/cli

# 2. Login (só uma vez, ou quando expirar)
railway login

# 3. Ir para a pasta do backend
cd backend

# 4. Linkar ao projeto (só uma vez)
railway link

# 5. Executar migrações
railway run npx prisma migrate deploy
```

**✅ Resultado esperado:**
```
✅ Applied migration: 20251104114307_init
✅ Applied migration: 20251104115421_add_codigo_field
✅ Applied migration: 20251104124301_sistema_completo
```

---

## ❓ Troubleshooting

### Erro: "railway: command not found"

**Solução:**
```bash
npm install -g @railway/cli
```

Se ainda não funcionar, verifique se o npm está no PATH:
```bash
npm config get prefix
```

### Erro: "Not logged in"

**Solução:**
```bash
railway login
```

### Erro: "Project not linked"

**Solução:**
```bash
cd backend
railway link
```

### Erro: "Cannot find module"

**Solução:**
Certifique-se de estar na pasta `backend`:
```bash
cd backend
railway run npx prisma migrate deploy
```

### Erro: "Permission denied"

**Solução:**
No Windows, pode ser necessário executar o PowerShell como Administrador para instalar o CLI globalmente.

---

## 💡 Dicas

1. **Primeira vez:** Você precisa fazer login e linkar apenas uma vez
2. **Sessão:** O login permanece ativo até você fazer logout
3. **Múltiplos projetos:** Você pode linkar diferentes projetos em pastas diferentes
4. **Verificar projeto atual:** Use `railway status` para ver qual projeto está linkado

---

## 🎯 Checklist Rápido

- [ ] Railway CLI instalado (`railway --version`)
- [ ] Login feito (`railway login`)
- [ ] Na pasta `backend` (`cd backend`)
- [ ] Projeto linkado (`railway link`)
- [ ] Pronto para executar comandos! (`railway run ...`)

---

## 📝 Comandos Mais Comuns para Este Projeto

```bash
# Migrações
railway run npx prisma migrate deploy

# Criar admin
railway run npm run create:admin

# Ver status das migrações
railway run npx prisma migrate status

# Ver logs
railway logs

# Abrir dashboard
railway open
```

