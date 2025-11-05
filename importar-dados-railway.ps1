# Script para importar dados do dump SQL no Railway
# Execute: .\importar-dados-railway.ps1

# Configuracoes - ATUALIZE AQUI SE NECESSARIO
$DATABASE_URL = "mysql://root:AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu@nozomi.proxy.rlwy.net:21718/brindes"
$DUMP_PATH = "C:\Users\Lucas.Rodrigues\Documents\dumps\Dump20251104"

Write-Host "Iniciando importacao de dados para Railway..." -ForegroundColor Cyan
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
    
    # Verificar se o MySQL esta disponivel
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
    if (-not $mysqlPath) {
        Write-Host "ERRO: MySQL client nao encontrado!" -ForegroundColor Red
        Write-Host "   Instale o MySQL client ou use o metodo via Railway CLI" -ForegroundColor Yellow
        exit 1
    }
    
    # Ordem de importacao (respeitando foreign keys)
    $arquivos = @(
        @{Nome="brindes__prisma_migrations.sql"; Descricao="Historico de migracoes"},
        @{Nome="brindes_categorias.sql"; Descricao="Categorias"},
        @{Nome="brindes_usuarios.sql"; Descricao="Usuarios"},
        @{Nome="brindes_brindes.sql"; Descricao="Brindes"},
        @{Nome="brindes_centros_custo.sql"; Descricao="Centros de Custo"},
        @{Nome="brindes_movimentacoes.sql"; Descricao="Movimentacoes"},
        @{Nome="brindes_solicitacoes.sql"; Descricao="Solicitacoes"},
        @{Nome="brindes_itens_solicitacao.sql"; Descricao="Itens de Solicitacao"},
        @{Nome="brindes_aprovacoes.sql"; Descricao="Aprovacoes"},
        @{Nome="brindes_recomendacoes.sql"; Descricao="Recomendacoes"}
    )
    
    $sucesso = 0
    $erros = 0
    
    foreach ($arquivoInfo in $arquivos) {
        $arquivo = $arquivoInfo.Nome
        $descricao = $arquivoInfo.Descricao
        $arquivoCompleto = Join-Path $DUMP_PATH $arquivo
        
        if (Test-Path $arquivoCompleto) {
            Write-Host "Importando: $descricao ($arquivo)..." -ForegroundColor Cyan
            
            # Definir senha como variavel de ambiente
            $env:MYSQL_PWD = $password
            
            # Executar importacao usando Get-Content
            $conteudoSQL = Get-Content $arquivoCompleto -Raw -Encoding UTF8
            $conteudoSQL | mysql -h $mysqlHost -u $user -P $port $database 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   OK: $descricao importado com sucesso!" -ForegroundColor Green
                $sucesso++
            } else {
                Write-Host "   ERRO: Falha ao importar $descricao" -ForegroundColor Red
                $erros++
            }
            Write-Host ""
        } else {
            Write-Host "AVISO: Arquivo nao encontrado: $arquivo" -ForegroundColor Yellow
            Write-Host "   Caminho esperado: $arquivoCompleto" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Resumo da Importacao:" -ForegroundColor Cyan
    Write-Host "   Sucesso: $sucesso" -ForegroundColor Green
    Write-Host "   Erros: $erros" -ForegroundColor $(if ($erros -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
    
    if ($erros -eq 0) {
        Write-Host "Importacao concluida com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Yellow
        Write-Host "   1. Verifique os dados no Railway" -ForegroundColor Gray
        Write-Host "   2. Teste a API: https://brindes-production.up.railway.app/api/health" -ForegroundColor Gray
        Write-Host "   3. Teste o login no frontend" -ForegroundColor Gray
    } else {
        Write-Host "Alguns arquivos falharam. Verifique os erros acima." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "ERRO: DATABASE_URL invalida!" -ForegroundColor Red
    Write-Host "   Formato esperado: mysql://usuario:senha@host:porta/database" -ForegroundColor Yellow
    exit 1
}
