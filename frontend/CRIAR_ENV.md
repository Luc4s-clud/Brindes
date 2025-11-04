# 📝 Criar arquivo .env.production

## Método 1: PowerShell (Windows)

Abra o PowerShell na pasta `frontend/` e execute:

```powershell
@"
VITE_API_URL=https://SEU-PROJETO-RAILWAY.railway.app/api
"@ | Out-File -FilePath .env.production -Encoding utf8
```

**⚠️ IMPORTANTE:** Substitua `SEU-PROJETO-RAILWAY` pela URL real do seu backend no Railway.

## Método 2: Criar Manualmente

1. Abra o Bloco de Notas
2. Cole este conteúdo:
   ```
   VITE_API_URL=https://SEU-PROJETO-RAILWAY.railway.app/api
   ```
3. Salve como `.env.production` na pasta `frontend/`
4. Certifique-se de que o nome do arquivo é exatamente `.env.production` (com o ponto no início)

## Como encontrar a URL do Railway?

1. Acesse https://railway.app
2. Vá no seu projeto
3. Clique no serviço do backend
4. A URL aparece no topo (ex: `https://brindes-production.up.railway.app`)
5. Adicione `/api` no final

## Exemplo

Se a URL do Railway for: `https://brindes-production.up.railway.app`

O arquivo `.env.production` deve ter:
```
VITE_API_URL=https://brindes-production.up.railway.app/api
```

