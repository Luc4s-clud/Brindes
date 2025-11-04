# 🔗 Como Obter a URL do Backend no Railway

## Passo a Passo

1. **No dashboard do Railway:**
   - Clique no serviço **"Brindes"** (que está ativo)
   
2. **Vá na aba "Settings"** (Configurações)
   
3. **Procure por "Domains"** ou **"Network"**
   
4. **Você verá a URL pública**, geralmente algo como:
   - `https://brindes-production.up.railway.app`
   - Ou `https://brindes-[hash].railway.app`

5. **Alternativa:**
   - Vá na aba **"Details"** do serviço
   - A URL pode aparecer no topo ou em "Domains"
   - Ou procure por "Public URL" ou "Deploy URL"

6. **Se não aparecer URL pública:**
   - Clique em **"Generate Domain"** ou **"Add Domain"**
   - O Railway criará uma URL pública automaticamente

## Exemplo de URLs

- `https://brindes-production.up.railway.app`
- `https://brindes-abc123.railway.app`
- `https://zucchini-delight-production.up.railway.app`

## ⚠️ IMPORTANTE

A URL que você precisa é a URL PÚBLICA do serviço backend, não `localhost:8080`.

