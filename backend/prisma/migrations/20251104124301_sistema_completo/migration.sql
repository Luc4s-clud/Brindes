/*
  Warnings:

  - You are about to alter the column `tipo` on the `movimentacoes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[codigo]` on the table `brindes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `brindes` ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `especificacoes` TEXT NULL,
    ADD COLUMN `estoqueMinimo` INTEGER NULL,
    ADD COLUMN `fotoUrl` VARCHAR(191) NULL,
    ADD COLUMN `recomendacaoUso` TEXT NULL,
    ADD COLUMN `validade` DATETIME(3) NULL,
    MODIFY `descricao` TEXT NULL;

-- AlterTable
ALTER TABLE `movimentacoes` ADD COLUMN `fornecedor` VARCHAR(191) NULL,
    ADD COLUMN `valorUnitario` DOUBLE NULL,
    MODIFY `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    MODIFY `observacao` TEXT NULL;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `perfil` ENUM('MARKETING', 'GERENTE', 'SOLICITANTE', 'DIRETOR') NOT NULL,
    `setor` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    INDEX `usuarios_email_idx`(`email`),
    INDEX `usuarios_perfil_idx`(`perfil`),
    INDEX `usuarios_ativo_idx`(`ativo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `centros_custo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `orcamentoTotal` DOUBLE NULL,
    `orcamentoUtilizado` DOUBLE NOT NULL DEFAULT 0,
    `limitePorGerente` DOUBLE NULL,
    `limitePorEvento` DOUBLE NULL,
    `limitePorSetor` DOUBLE NULL,
    `setor` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `usuarioId` INTEGER NULL,

    UNIQUE INDEX `centros_custo_nome_key`(`nome`),
    UNIQUE INDEX `centros_custo_usuarioId_key`(`usuarioId`),
    INDEX `centros_custo_setor_idx`(`setor`),
    INDEX `centros_custo_ativo_idx`(`ativo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroSolicitacao` VARCHAR(191) NOT NULL,
    `solicitanteId` INTEGER NOT NULL,
    `centroCustoId` INTEGER NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA', 'ENTREGUE', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `justificativa` TEXT NULL,
    `enderecoEntrega` TEXT NULL,
    `prazoEntrega` DATETIME(3) NULL,
    `finalidade` VARCHAR(191) NULL,
    `valorTotal` DOUBLE NULL,
    `observacoes` TEXT NULL,
    `dataEntrega` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `solicitacoes_numeroSolicitacao_key`(`numeroSolicitacao`),
    INDEX `solicitacoes_solicitanteId_idx`(`solicitanteId`),
    INDEX `solicitacoes_centroCustoId_idx`(`centroCustoId`),
    INDEX `solicitacoes_status_idx`(`status`),
    INDEX `solicitacoes_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_solicitacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitacaoId` INTEGER NOT NULL,
    `brindeId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `quantidadeEntregue` INTEGER NOT NULL DEFAULT 0,
    `valorUnitario` DOUBLE NULL,
    `observacao` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `itens_solicitacao_solicitacaoId_idx`(`solicitacaoId`),
    INDEX `itens_solicitacao_brindeId_idx`(`brindeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aprovacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitacaoId` INTEGER NOT NULL,
    `aprovadorId` INTEGER NOT NULL,
    `status` ENUM('APROVADA', 'REJEITADA') NOT NULL,
    `observacao` TEXT NULL,
    `nivelAprovacao` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `aprovacoes_solicitacaoId_idx`(`solicitacaoId`),
    INDEX `aprovacoes_aprovadorId_idx`(`aprovadorId`),
    INDEX `aprovacoes_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recomendacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `imagemUrl` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `categoria` VARCHAR(191) NULL,
    `sugeridoPor` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
    `observacao` TEXT NULL,
    `aprovadoPor` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `recomendacoes_status_idx`(`status`),
    INDEX `recomendacoes_categoria_idx`(`categoria`),
    INDEX `recomendacoes_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `brindes_codigo_key` ON `brindes`(`codigo`);

-- CreateIndex
CREATE INDEX `brindes_codigo_idx` ON `brindes`(`codigo`);

-- CreateIndex
CREATE INDEX `brindes_categoria_idx` ON `brindes`(`categoria`);

-- CreateIndex
CREATE INDEX `brindes_ativo_idx` ON `brindes`(`ativo`);

-- CreateIndex
CREATE INDEX `brindes_quantidade_idx` ON `brindes`(`quantidade`);

-- CreateIndex
CREATE INDEX `movimentacoes_tipo_idx` ON `movimentacoes`(`tipo`);

-- CreateIndex
CREATE INDEX `movimentacoes_createdAt_idx` ON `movimentacoes`(`createdAt`);

-- AddForeignKey
ALTER TABLE `centros_custo` ADD CONSTRAINT `centros_custo_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes` ADD CONSTRAINT `solicitacoes_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes` ADD CONSTRAINT `solicitacoes_centroCustoId_fkey` FOREIGN KEY (`centroCustoId`) REFERENCES `centros_custo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_solicitacao` ADD CONSTRAINT `itens_solicitacao_solicitacaoId_fkey` FOREIGN KEY (`solicitacaoId`) REFERENCES `solicitacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_solicitacao` ADD CONSTRAINT `itens_solicitacao_brindeId_fkey` FOREIGN KEY (`brindeId`) REFERENCES `brindes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aprovacoes` ADD CONSTRAINT `aprovacoes_solicitacaoId_fkey` FOREIGN KEY (`solicitacaoId`) REFERENCES `solicitacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aprovacoes` ADD CONSTRAINT `aprovacoes_aprovadorId_fkey` FOREIGN KEY (`aprovadorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `movimentacoes` RENAME INDEX `movimentacoes_brindeId_fkey` TO `movimentacoes_brindeId_idx`;
