# 📥 Importar Dados - Comandos Diretos

Como o MySQL client não está instalado localmente, você pode usar uma das seguintes opções:

## Opção 1: Via Railway Connect MySQL (Recomendado)

### Passo 1: Conectar ao MySQL do Railway

```bash
railway connect MySQL
```

Isso abrirá uma conexão direta com o banco.

### Passo 2: Importar os Arquivos

Você precisará copiar e colar o conteúdo dos arquivos SQL um por um, ou usar comandos SOURCE.

**No terminal do Railway MySQL, execute:**

```sql
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes__prisma_migrations.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_categorias.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_usuarios.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_brindes.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_centros_custo.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_movimentacoes.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_solicitacoes.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_itens_solicitacao.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_aprovacoes.sql;
SOURCE C:/Users/Lucas.Rodrigues/Documents/dumps/Dump20251104/brindes_recomendacoes.sql;
```

---

## Opção 2: Instalar MySQL Client

### Windows (Chocolatey):

```powershell
choco install mysql
```

### Windows (Instalador):

1. Baixe o MySQL Community Server: https://dev.mysql.com/downloads/mysql/
2. Instale apenas o "MySQL Client"
3. Adicione ao PATH ou use o caminho completo

Depois execute o script `importar-dados-railway.ps1` novamente.

---

## Opção 3: Usar MySQL Workbench

1. Abra o MySQL Workbench
2. Crie uma nova conexão:
   - Host: `nozomi.proxy.rlwy.net`
   - Port: `21718`
   - Username: `root`
   - Password: `AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu`
3. Conecte-se
4. Selecione o banco `brindes`
5. Vá em **Server** → **Data Import**
6. Selecione **Import from Self-Contained File**
7. Escolha cada arquivo SQL e importe na ordem correta

---

## Opção 4: Comandos PowerShell Individuais

Se você tiver acesso ao MySQL de outra forma, execute estes comandos um por um:

```powershell
# Configurar variáveis
$mysqlHost = "nozomi.proxy.rlwy.net"
$port = "21718"
$user = "root"
$password = "AZAFgkKlfQlHKkhXIklKaYaaSDqOngdu"
$database = "brindes"
$dumpPath = "C:\Users\Lucas.Rodrigues\Documents\dumps\Dump20251104"

# Definir senha
$env:MYSQL_PWD = $password

# Importar (substitua mysql pelo caminho completo do seu MySQL client)
Get-Content "$dumpPath\brindes__prisma_migrations.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_categorias.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_usuarios.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_brindes.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_centros_custo.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_movimentacoes.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_solicitacoes.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_itens_solicitacao.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_aprovacoes.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
Get-Content "$dumpPath\brindes_recomendacoes.sql" -Raw | mysql -h $mysqlHost -u $user -P $port $database
```

---

## Ordem de Importação (IMPORTANTE!)

1. `brindes__prisma_migrations.sql`
2. `brindes_categorias.sql`
3. `brindes_usuarios.sql`
4. `brindes_brindes.sql`
5. `brindes_centros_custo.sql`
6. `brindes_movimentacoes.sql`
7. `brindes_solicitacoes.sql`
8. `brindes_itens_solicitacao.sql`
9. `brindes_aprovacoes.sql`
10. `brindes_recomendacoes.sql`

---

## Recomendação

Use a **Opção 1 (Railway Connect MySQL)** que é a mais simples e não requer instalação adicional.

