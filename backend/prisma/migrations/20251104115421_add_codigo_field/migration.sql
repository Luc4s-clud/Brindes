/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `brindes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `brindes` ADD COLUMN `codigo` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `brindes_nome_key` ON `brindes`(`nome`);
