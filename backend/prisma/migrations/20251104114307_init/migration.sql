-- CreateTable
CREATE TABLE `brindes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `categoria` VARCHAR(191) NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `valorUnitario` DOUBLE NULL,
    `fornecedor` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categorias_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimentacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brindeId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `movimentacoes` ADD CONSTRAINT `movimentacoes_brindeId_fkey` FOREIGN KEY (`brindeId`) REFERENCES `brindes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
