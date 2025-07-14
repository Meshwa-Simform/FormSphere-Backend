/*
  Warnings:

  - You are about to drop the column `action` on the `ConditionalLogic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConditionalLogic" DROP COLUMN "action";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "action" TEXT NOT NULL DEFAULT 'show',
ADD COLUMN     "condition" TEXT;
