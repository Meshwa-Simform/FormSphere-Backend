/*
  Warnings:

  - You are about to drop the column `questionId` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `responseAnswer` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `stylingId` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the `Styling` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `questionType` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styling` to the `Templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_userId_fkey";

-- DropForeignKey
ALTER TABLE "Styling" DROP CONSTRAINT "Styling_formId_fkey";

-- DropForeignKey
ALTER TABLE "Templates" DROP CONSTRAINT "Templates_stylingId_fkey";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "styling" JSONB,
ALTER COLUMN "noOfPages" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "questionId",
DROP COLUMN "responseAnswer";

-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "stylingId",
ADD COLUMN     "styling" JSONB NOT NULL,
ALTER COLUMN "noOfPages" SET DEFAULT 1;

-- DropTable
DROP TABLE "Styling";

-- CreateTable
CREATE TABLE "Answer" (
    "id" UUID NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" UUID NOT NULL,
    "questionType" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionOptions" TEXT[],
    "questionAnswer" TEXT,
    "questionOrder" INTEGER NOT NULL,
    "responseAnswer" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnswerToResponse" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AnswerToResponse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AnswerToResponse_B_index" ON "_AnswerToResponse"("B");

-- AddForeignKey
ALTER TABLE "_AnswerToResponse" ADD CONSTRAINT "_AnswerToResponse_A_fkey" FOREIGN KEY ("A") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnswerToResponse" ADD CONSTRAINT "_AnswerToResponse_B_fkey" FOREIGN KEY ("B") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;
