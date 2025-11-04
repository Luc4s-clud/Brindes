# 🌐 Deploy do Frontend na Hostinger

## 📋 Pré-requisitos

- ✅ Backend rodando no Railway
- ✅ URL do backend do Railway (ex: `https://seu-projeto.railway.app`)
- ✅ Domínio configurado na Hostinger
- ✅ Acesso ao painel de controle da Hostinger (File Manager ou FTP)

---

## 🔧 Passo 1: Configurar URL da API

### Criar arquivo `.env.production`

No diretório `frontend/`, crie um arquivo `.env.production`:

**No Windows (PowerShell):**
```powershell
cd frontend
@"
VITE_API_URL=https://seu-projeto.railway.app/api
"@ | Out-File -FilePath .env.production -Encoding utf8
```

**Ou crie manualmente:**
1. Abra o Bloco de Notas ou seu editor favorito
2. Cole o seguinte conteúdo:
   ```env
   VITE_API_URL=https://seu-projeto.railway.app/api
   ```
3. Salve como `.env.production` na pasta `frontend/`
4. **⚠️ IMPORTANTE:** Substitua `seu-projeto.railway.app` pela URL real do seu backend no Railway

**Exemplo real:**
```env
VITE_API_URL=https://brindes-production.up.railway.app/api
```

**⚠️ IMPORTANTE:**
- A URL deve terminar com `/api`
- Use `https://` (não `http://`)
- Para encontrar a URL do Railway, vá no dashboard do Railway → seu projeto → clique no serviço backend → a URL aparece no topo

---

## 🏗️ Passo 2: Fazer o Build

Execute o comando de build:

```bash
cd frontend
npm run build
```

Isso vai:
- ✅ Compilar o TypeScript
- ✅ Gerar os arquivos otimizados
- ✅ Criar a pasta `dist/` com todos os arquivos prontos para produção

**✅ Você verá:** `Build completed in Xs`

---

## 📦 Passo 3: Verificar o Build

Antes de fazer upload, verifique se o build foi criado:

```bash
cd frontend
ls dist
```

Você deve ver arquivos como:
- `index.html`
- `assets/` (pasta com JS, CSS, imagens)
- Outros arquivos estáticos

---

## 📤 Passo 4: Fazer Upload na Hostinger

### Opção A: Via File Manager (Recomendado - Mais Simples)

1. **Acesse o painel da Hostinger:**
   - Faça login no painel de controle
   - Vá em **"Gerenciador de Arquivos"** ou **"File Manager"**

2. **Navegue até a pasta do domínio:**
   - Geralmente em `public_html/` ou `www/` ou nome do seu domínio
   - **⚠️ IMPORTANTE:** Se já há arquivos lá, faça backup primeiro!

3. **Limpar pasta (se necessário):**
   - Selecione todos os arquivos antigos
   - Delete ou faça backup

4. **Fazer upload:**
   - Clique em **"Upload"** ou **"Enviar arquivos"**
   - Selecione **todos os arquivos** da pasta `frontend/dist/`
   - Ou arraste e solte os arquivos
   - **⚠️ IMPORTANTE:** Faça upload de **todos os arquivos**, incluindo:
     - `index.html`
     - Toda a pasta `assets/`
     - Qualquer outro arquivo na pasta `dist/`

5. **Verificar estrutura:**
   - Após upload, a estrutura deve ser:
     ```
     public_html/
     ├── index.html
     ├── assets/
     │   ├── index-xxxxx.js
     │   ├── index-xxxxx.css
     │   └── ...
     ```

### Opção B: Via FTP

1. **Configurar cliente FTP:**
   - Use FileZilla, WinSCP ou outro cliente FTP
   - Dados de conexão estão no painel da Hostinger

2. **Conectar ao servidor:**
   - Host: geralmente `ftp.seusite.com` ou IP fornecido
   - Usuário e senha: fornecidos pela Hostinger
   - Porta: 21 (FTP) ou 22 (SFTP)

3. **Navegar e fazer upload:**
   - Conecte-se
   - Vá para `public_html/` ou pasta do domínio
   - Faça upload de todos os arquivos de `frontend/dist/`

---

## 🔄 Passo 5: Configurar CORS no Backend (Railway)

Certifique-se de que o backend está configurado para aceitar requisições do seu domínio:

**No Railway, variável de ambiente do backend:**
```env
FRONTEND_URL=https://seusite.com
```

Isso permite que o backend aceite requisições do seu domínio na Hostinger.

---

## ✅ Passo 6: Testar

1. **Acesse seu domínio:**
   - Ex: `https://seusite.com`
   - Deve carregar a aplicação React

2. **Testar login:**
   - Tente fazer login
   - Verifique se as requisições estão funcionando

3. **Verificar console do navegador:**
   - Pressione `F12`
   - Vá em **Console** e **Network**
   - Verifique se não há erros de CORS ou conexão

---

## 🔧 Configurações Adicionais

### Configurar .htaccess (se necessário)

Se você usar React Router, pode precisar de um arquivo `.htaccess` na raiz:

**Criar arquivo `.htaccess` em `frontend/dist/.htaccess`:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Depois, faça upload deste arquivo também para a raiz do `public_html/`.

---

## 📋 Checklist Final

- [ ] Arquivo `.env.production` criado com URL da API do Railway
- [ ] Build executado (`npm run build`)
- [ ] Pasta `dist/` criada com sucesso
- [ ] Todos os arquivos de `dist/` enviados para Hostinger
- [ ] `FRONTEND_URL` configurado no Railway
- [ ] Site acessível no domínio
- [ ] Login funcionando
- [ ] API respondendo corretamente

---

## 🔍 Troubleshooting

### Erro: "Cannot GET /rota"
**Problema:** React Router não está configurado no servidor  
**Solução:** Adicione o arquivo `.htaccess` (veja acima)

### Erro: CORS
**Problema:** Backend não aceita requisições do domínio  
**Solução:** Configure `FRONTEND_URL` no Railway com a URL completa do seu domínio

### Erro: "Failed to fetch"
**Problema:** URL da API incorreta  
**Solução:** Verifique o `.env.production` e confirme que a URL do Railway está correta

### Página em branco
**Problema:** Arquivos não foram carregados corretamente  
**Solução:** 
- Verifique se todos os arquivos foram enviados
- Verifique o console do navegador (F12)
- Confirme que o caminho dos assets está correto

### Build não funciona
**Problema:** Erros no build  
**Solução:**
```bash
cd frontend
npm install  # Reinstalar dependências
npm run build  # Tentar novamente
```

---

## 💡 Dicas

1. **Backup:** Sempre faça backup antes de fazer upload
2. **Teste local:** Teste o build localmente primeiro: `npm run preview`
3. **Cache:** Limpe o cache do navegador após deploy (Ctrl+Shift+R)
4. **SSL:** Certifique-se de que o SSL está ativo no domínio (HTTPS)
5. **Atualizações:** Para atualizar, faça novo build e reenvie os arquivos

---

## 🚀 Próximos Passos

Após o deploy:
1. ✅ Testar todas as funcionalidades
2. ✅ Verificar responsividade em diferentes dispositivos
3. ✅ Configurar monitoramento (se necessário)
4. ✅ Configurar backups regulares

---

## 📝 Script Rápido de Deploy

Crie um script para facilitar o deploy futuro:

**`frontend/deploy.sh`** (Linux/Mac):
```bash
#!/bin/bash
echo "🔨 Fazendo build..."
npm run build
echo "✅ Build concluído!"
echo "📦 Arquivos em: frontend/dist/"
echo "📤 Faça upload para Hostinger"
```

**`frontend/deploy.bat`** (Windows):
```batch
@echo off
echo 🔨 Fazendo build...
call npm run build
echo ✅ Build concluído!
echo 📦 Arquivos em: frontend/dist/
echo 📤 Faça upload para Hostinger
pause
```

