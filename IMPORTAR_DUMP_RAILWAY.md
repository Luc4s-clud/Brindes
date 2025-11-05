# 📥 Importar Dados do Dump SQL no Railway

## 📋 Pré-requisitos

- ✅ Banco "brindes" criado no Railway
- ✅ DATABASE_URL configurada no Railway
- ✅ Migrações executadas (`railway run npx prisma migrate deploy`)
- ✅ Arquivos SQL disponíveis localmente

---

## 🎯 Ordem de Importação (Importante!)

Devido às foreign keys, a ordem de importação é importante:

1. **`_prisma_migrations`** - Histórico de migrações
2. **`categorias`** - Sem dependências
3. **`usuarios`** - Sem dependências (mas necessário para outras tabelas)
4. **`brindes`** - Depende de categorias
5. **`centros_custo`** - Depende de usuarios
6. **`movimentacoes`** - Depende de brindes
7. **`solicitacoes`** - Depende de usuarios e centros_custo
8. **`itens_solicitacao`** - Depende de solicitacoes e brindes
9. **`aprovacoes`** - Depende de solicitacoes e usuarios
10. **`recomendacoes`** - Sem dependências críticas

---

## 🔧 Método 1: Via Railway CLI (Recomendado)

### Passo 1: Preparar o Comando

Você pode importar usando o comando `mysql` via Railway CLI. Primeiro, vamos criar um script para facilitar:

**Criar arquivo `importar-dados.ps1` (Windows):**

```powershell
# Configurações
$DATABASE_URL = "mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/brindes"
$DUMP_PATH = "C:\Users\Lucas.Rodrigues\Documents\dumps\Dump20251104"

# Extrair informações da URL
if ($DATABASE_URL -match "mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "Importando dados para: $host:$port/$database"
    
    # Ordem de importação
    $arquivos = @(
        "brindes__prisma_migrations.sql",
        "brindes_categorias.sql",
        "brindes_usuarios.sql",
        "brindes_brindes.sql",
        "brindes_centros_custo.sql",
        "brindes_movimentacoes.sql",
        "brindes_solicitacoes.sql",
        "brindes_itens_solicitacao.sql",
        "brindes_aprovacoes.sql",
        "brindes_recomendacoes.sql"
    )
    
    foreach ($arquivo in $arquivos) {
        $arquivoCompleto = Join-Path $DUMP_PATH $arquivo
        if (Test-Path $arquivoCompleto) {
            Write-Host "Importando: $arquivo..."
            $env:MYSQL_PWD = $password
            mysql -h $host -u $user -P $port $database < $arquivoCompleto
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $arquivo importado com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "❌ Erro ao importar $arquivo" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  Arquivo não encontrado: $arquivoCompleto" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ Importação concluída!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao parsear DATABASE_URL" -ForegroundColor Red
}
```

### Passo 2: Executar o Script

```powershell
cd C:\TESTES\Brindes
.\importar-dados.ps1
```

---

## 🔧 Método 2: Via MySQL Client Local

### Passo 1: Conectar ao Banco do Railway

```bash
mysql -h nozomi.proxy.rlwy.net -u root -pAZAFgkKlfQlHKkhXIklKaYaaSDqOngdu --port 21718 --protocol=TCP brindes
```

### Passo 2: Importar os Arquivos

**No PowerShell, execute um por um:**

```powershell
# Definir variáveis
$host = "nozomi.proxy.rlwy.net"
$port = "21718"
$user = "root"
$password = "AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu"
$database = "brindes"
$dumpPath = "C:\Users\Lucas.Rodrigues\Documents\dumps\Dump20251104"

# Importar na ordem correta
$env:MYSQL_PWD = $password

# 1. Migrações
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes__prisma_migrations.sql"

# 2. Categorias
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_categorias.sql"

# 3. Usuários
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_usuarios.sql"

# 4. Brindes
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_brindes.sql"

# 5. Centros de Custo
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_centros_custo.sql"

# 6. Movimentações
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_movimentacoes.sql"

# 7. Solicitações
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_solicitacoes.sql"

# 8. Itens Solicitação
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_itens_solicitacao.sql"

# 9. Aprovações
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_aprovacoes.sql"

# 10. Recomendações
mysql -h $host -u $user -P $port $database < "$dumpPath\brindes_recomendacoes.sql"
```

---

## 🔧 Método 3: Via Terminal do Railway

### Passo 1: Fazer Upload dos Arquivos

1. No Railway, vá no serviço do backend
2. Abra o terminal (Deployments → três pontos → Open Terminal)
3. Use `railway connect MySQL` para conectar ao banco

### Passo 2: Importar via Terminal

Você precisará fazer upload dos arquivos primeiro ou copiar o conteúdo.

---

## ⚡ Método Rápido: Script PowerShell Completo

Vou criar um script automatizado para você:

