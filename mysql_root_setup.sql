-- ============================================
-- Script de Configuração usando ROOT
-- Execute este script no MySQL Workbench
-- ============================================

-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS brindes 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Selecionar o banco de dados
USE brindes;

-- 3. Verificar se o root tem todas as permissões (geralmente já tem)
SHOW GRANTS FOR 'root'@'localhost';

-- 4. Se necessário, garantir que o root tem todas as permissões
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- 5. Verificar se o banco foi criado
SHOW DATABASES LIKE 'brindes';

