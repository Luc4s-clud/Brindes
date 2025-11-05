# Script para importar dados SQL via PowerShell (sem precisar do MySQL client)
# Usa Invoke-WebRequest ou conexao direta via .NET

# Configuracoes
$DATABASE_URL = "mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/brindes"
$DUMP_PATH = "C:\Users\Lucas.Rodrigues\Documents\dumps\Dump20251104"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Importacao de Dados SQL via PowerShell" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Extrair informacoes da URL
if ($DATABASE_URL -match "mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $user = $matches[1]
    $password = $matches[2]
    $mysqlHost = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "Configuracao:" -ForegroundColor Yellow
    Write-Host "   Host: $mysqlHost" -ForegroundColor Gray
    Write-Host "   Port: $port" -ForegroundColor Gray
    Write-Host "   Database: $database" -ForegroundColor Gray
    Write-Host "   Dump Path: $DUMP_PATH" -ForegroundColor Gray
    Write-Host ""
    
    # Verificar se os arquivos existem
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
    
    Write-Host "Verificando arquivos..." -ForegroundColor Cyan
    $arquivosExistentes = @()
    foreach ($arquivo in $arquivos) {
        $arquivoCompleto = Join-Path $DUMP_PATH $arquivo
        if (Test-Path $arquivoCompleto) {
            $arquivosExistentes += $arquivoCompleto
            Write-Host "   OK: $arquivo" -ForegroundColor Green
        } else {
            Write-Host "   ERRO: $arquivo nao encontrado" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    if ($arquivosExistentes.Count -eq 0) {
        Write-Host "ERRO: Nenhum arquivo encontrado!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "OPCOES DE IMPORTACAO:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPCAO 1: MySQL Workbench (Recomendado)" -ForegroundColor Yellow
    Write-Host "   1. Abra MySQL Workbench" -ForegroundColor Gray
    Write-Host "   2. Crie conexao:" -ForegroundColor Gray
    Write-Host "      - Host: $mysqlHost" -ForegroundColor Gray
    Write-Host "      - Port: $port" -ForegroundColor Gray
    Write-Host "      - User: $user" -ForegroundColor Gray
    Write-Host "      - Password: $password" -ForegroundColor Gray
    Write-Host "   3. Conecte-se ao banco '$database'" -ForegroundColor Gray
    Write-Host "   4. Vá em Server > Data Import" -ForegroundColor Gray
    Write-Host "   5. Importe os arquivos na ordem listada abaixo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPCAO 2: Instalar MySQL Client" -ForegroundColor Yellow
    Write-Host "   Execute: choco install mysql-client" -ForegroundColor Gray
    Write-Host "   Ou baixe: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPCAO 3: Via Terminal Web do Railway" -ForegroundColor Yellow
    Write-Host "   1. No Railway, abra o terminal do servico MySQL" -ForegroundColor Gray
    Write-Host "   2. Use comandos SOURCE para importar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "ORDEM DE IMPORTACAO:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $ordem = 1
    foreach ($arquivoCompleto in $arquivosExistentes) {
        $nomeArquivo = Split-Path $arquivoCompleto -Leaf
        Write-Host "$ordem. $nomeArquivo" -ForegroundColor Cyan
        Write-Host "   $arquivoCompleto" -ForegroundColor Gray
        $ordem++
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "COMANDOS SQL PARA COPiar/COLAR:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Se voce tiver acesso ao MySQL (via Workbench ou terminal):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "USE brindes;" -ForegroundColor Green
    Write-Host ""
    
    foreach ($arquivoCompleto in $arquivosExistentes) {
        # Converter caminho Windows para formato MySQL
        $caminhoMySQL = $arquivoCompleto -replace "\\", "/"
        Write-Host "SOURCE $caminhoMySQL;" -ForegroundColor Green
    }
    
} else {
    Write-Host "ERRO: DATABASE_URL invalida!" -ForegroundColor Red
    exit 1
}

