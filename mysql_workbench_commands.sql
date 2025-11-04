-- ============================================
-- Script de Configuração do Banco de Dados
-- Execute este script no MySQL Workbench
-- ============================================

-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS brindes 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Selecionar o banco de dados
USE brindes;

-- 3. Criar o usuário (substitua 'sua_senha_forte_aqui' por uma senha segura)
-- Exemplo de senha: MinhaSenha@123
CREATE USER IF NOT EXISTS 'brindes_user'@'localhost' 
IDENTIFIED BY 'sua_senha_forte_aqui';

-- 4. Conceder todas as permissões no banco brindes
GRANT ALL PRIVILEGES ON brindes.* TO 'brindes_user'@'localhost';

-- 5. IMPORTANTE: Dar permissão para criar bancos de dados (necessário para Prisma Migrate shadow database)
GRANT CREATE ON *.* TO 'brindes_user'@'localhost';

-- 6. Aplicar as mudanças de permissões
FLUSH PRIVILEGES;

-- ============================================
-- Verificações (opcional - para confirmar)
-- ============================================

-- Verificar se o banco foi criado
SHOW DATABASES LIKE 'brindes';

-- Verificar se o usuário foi criado
SELECT user, host FROM mysql.user WHERE user = 'brindes_user';

-- Verificar as permissões do usuário
SHOW GRANTS FOR 'brindes_user'@'localhost';

