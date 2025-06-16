/*
  Warnings:

  - You are about to drop the `_AnswerToResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AnswerToResponse" DROP CONSTRAINT "_AnswerToResponse_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnswerToResponse" DROP CONSTRAINT "_AnswerToResponse_B_fkey";

-- DropTable
DROP TABLE "_AnswerToResponse";

-- Alter Type
ALTER TABLE "Answer" ALTER COLUMN "responseId" type UUID using "responseId"::uuid;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;
