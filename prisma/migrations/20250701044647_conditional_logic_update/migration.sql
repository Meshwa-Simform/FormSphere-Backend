/*
  Warnings:

  - You are about to drop the column `condition_check` on the `ConditionalLogic` table. All the data in the column will be lost.
  - Added the required column `action` to the `ConditionalLogic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operator` to the `ConditionalLogic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `ConditionalLogic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConditionalLogic" DROP COLUMN "condition_check",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "operator" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;
