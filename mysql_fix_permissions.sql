-- ============================================
-- Script para CORRIGIR permissões do usuário
-- Execute este script no MySQL Workbench
-- ============================================

-- Verificar qual usuário você está usando
-- Se você criou como 'brindes' ao invés de 'brindes_user', ajuste os comandos abaixo
SELECT user, host FROM mysql.user WHERE user LIKE '%brinde%';

-- ============================================
-- OPÇÃO 1: Se você criou o usuário como 'brindes_user'
-- ============================================

-- Conceder todas as permissões no banco brindes
GRANT ALL PRIVILEGES ON brindes.* TO 'brindes_user'@'localhost';

-- IMPORTANTE: Dar permissão para criar bancos de dados (necessário para Prisma Migrate)
GRANT CREATE ON *.* TO 'brindes_user'@'localhost';

-- Aplicar as mudanças
FLUSH PRIVILEGES;

-- Verificar as permissões
SHOW GRANTS FOR 'brindes_user'@'localhost';

-- ============================================
-- OPÇÃO 2: Se você criou o usuário como 'brindes'
-- ============================================

-- Conceder todas as permissões no banco brindes
GRANT ALL PRIVILEGES ON brindes.* TO 'brindes'@'localhost';

-- IMPORTANTE: Dar permissão para criar bancos de dados
GRANT CREATE ON *.* TO 'brindes'@'localhost';

-- Aplicar as mudanças
FLUSH PRIVILEGES;

-- Verificar as permissões
SHOW GRANTS FOR 'brindes'@'localhost';

-- ============================================
-- ALTERNATIVA: Se você quiser usar o usuário root (apenas para desenvolvimento)
-- ============================================

-- Verificar se o root tem permissões
SHOW GRANTS FOR 'root'@'localhost';

