# Guia de Configuração do MySQL

Este guia irá ajudá-lo a configurar o MySQL para o projeto.

## Pré-requisitos

- MySQL instalado e rodando
- Acesso ao MySQL como root ou usuário com privilégios de administração

## Passo a Passo

### 1. Verificar se o MySQL está rodando

**Windows:**
```powershell
# Verificar se o serviço está rodando
Get-Service -Name MySQL*

# Ou inicie o serviço se necessário
Start-Service -Name MySQL80
```

**Linux/Mac:**
```bash
sudo systemctl status mysql
# ou
sudo service mysql status
```

### 2. Conectar ao MySQL

Abra o terminal e conecte-se ao MySQL:

```bash
mysql -u root -p
```

Digite a senha do root quando solicitado.

### 3. Criar o Banco de Dados

Execute os seguintes comandos SQL no MySQL:

```sql
-- Criar o banco de dados
CREATE DATABASE brindes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar se foi criado
SHOW DATABASES;
```

### 4. Criar o Usuário e Conceder Permissões

```sql
-- Criar o usuário (substitua 'senha_forte_aqui' por uma senha segura)
CREATE USER 'brindes_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';

-- Conceder todas as permissões no banco brindes
GRANT ALL PRIVILEGES ON brindes.* TO 'brindes_user'@'localhost';

-- Aplicar as mudanças
FLUSH PRIVILEGES;

-- Verificar se o usuário foi criado
SELECT user, host FROM mysql.user WHERE user = 'brindes_user';
```

### 5. Configurar o arquivo .env

No arquivo `backend/.env`, configure a URL de conexão:

```
PORT=3001
DATABASE_URL="mysql://brindes_user:senha_forte_aqui@localhost:3306/brindes"
NODE_ENV=development
JWT_SECRET=seu_secret_jwt_aqui
```

**⚠️ IMPORTANTE:** 
- Substitua `senha_forte_aqui` pela senha que você definiu no passo 4
- Se sua senha contiver caracteres especiais, você pode precisar codificá-la na URL (ex: `@` vira `%40`, `#` vira `%23`)

### 6. Testar a Conexão

Execute o comando para testar:

```bash
cd backend
npx prisma db pull
```

Se funcionar, você verá a mensagem de sucesso. Se ainda houver erro, verifique:

1. **MySQL está rodando?**
   ```powershell
   Get-Service -Name MySQL*
   ```

2. **Usuário e senha estão corretos?**
   - Teste conectando manualmente: `mysql -u brindes_user -p`
   - Digite a senha quando solicitado

3. **Banco de dados existe?**
   ```sql
   SHOW DATABASES;
   ```

4. **Permissões estão corretas?**
   ```sql
   SHOW GRANTS FOR 'brindes_user'@'localhost';
   ```

### 7. Executar as Migrações

Uma vez que a conexão estiver funcionando:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Solução de Problemas Comuns

### Erro: "Access denied for user"

**Solução:**
1. Verifique se o usuário existe: `SELECT user, host FROM mysql.user;`
2. Verifique se a senha está correta
3. Tente recriar o usuário:
   ```sql
   DROP USER 'brindes_user'@'localhost';
   CREATE USER 'brindes_user'@'localhost' IDENTIFIED BY 'nova_senha';
   GRANT ALL PRIVILEGES ON brindes.* TO 'brindes_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Erro: "Can't connect to MySQL server"

**Solução:**
1. Verifique se o MySQL está rodando
2. Verifique a porta (padrão é 3306)
3. Verifique se não há firewall bloqueando

### Senha com caracteres especiais

Se sua senha contém caracteres especiais, você precisa codificá-los na URL:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Exemplo:
```
Senha: Minha@Senha#123
URL: mysql://brindes_user:Minha%40Senha%23123@localhost:3306/brindes
```

### Usar o usuário root (não recomendado para produção)

Se quiser usar o root temporariamente para testes:

```sql
-- Conceder permissões
GRANT ALL PRIVILEGES ON brindes.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

E no `.env`:
```
DATABASE_URL="mysql://root:senha_do_root@localhost:3306/brindes"
```

## Próximos Passos

Após configurar corretamente:

1. ✅ Banco de dados criado
2. ✅ Usuário criado e permissões concedidas
3. ✅ Arquivo `.env` configurado
4. ✅ Testar conexão
5. ✅ Executar migrações
6. ✅ Iniciar o servidor

