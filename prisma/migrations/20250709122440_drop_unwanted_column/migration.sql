/*
  Warnings:

  - You are about to drop the column `questionAnswer` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionOptions` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionOrder` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionText` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionType` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `isSinglePage` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `noOfPages` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `privateSharingToken` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `styling` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `isSinglePage` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `privateSharingToken` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the `ConditionalLogic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_userId_fkey";

-- DropForeignKey
ALTER TABLE "FormAccess" DROP CONSTRAINT "FormAccess_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormConditionalLogic" DROP CONSTRAINT "FormConditionalLogic_action_questionId_fkey";

-- DropForeignKey
ALTER TABLE "FormConditionalLogic" DROP CONSTRAINT "FormConditionalLogic_formVersionId_fkey";

-- DropForeignKey
ALTER TABLE "FormConditionalLogic" DROP CONSTRAINT "FormConditionalLogic_questionId_fkey";

-- DropForeignKey
ALTER TABLE "FormQuestion" DROP CONSTRAINT "FormQuestion_formVersionId_fkey";

-- DropForeignKey
ALTER TABLE "FormQuestionOption" DROP CONSTRAINT "FormQuestionOption_formQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_formVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_userId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateConditionalLogic" DROP CONSTRAINT "TemplateConditionalLogic_action_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateConditionalLogic" DROP CONSTRAINT "TemplateConditionalLogic_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateConditionalLogic" DROP CONSTRAINT "TemplateConditionalLogic_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateQuestion" DROP CONSTRAINT "TemplateQuestion_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateQuestionOption" DROP CONSTRAINT "TemplateQuestionOption_templateQuestionId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "questionAnswer",
DROP COLUMN "questionOptions",
DROP COLUMN "questionOrder",
DROP COLUMN "questionText",
DROP COLUMN "questionType";

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "description",
DROP COLUMN "isSinglePage",
DROP COLUMN "logoUrl",
DROP COLUMN "noOfPages",
DROP COLUMN "privateSharingToken",
DROP COLUMN "styling",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "userEmail",
DROP COLUMN "userName";

-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "isSinglePage",
DROP COLUMN "privateSharingToken";

-- DropTable
DROP TABLE "ConditionalLogic";

-- DropTable
DROP TABLE "Question";

-- AddForeignKey
ALTER TABLE "FormAccess" ADD CONSTRAINT "FormAccess_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestionOption" ADD CONSTRAINT "FormQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormConditionalLogic" ADD CONSTRAINT "FormConditionalLogic_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormConditionalLogic" ADD CONSTRAINT "FormConditionalLogic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormConditionalLogic" ADD CONSTRAINT "FormConditionalLogic_action_questionId_fkey" FOREIGN KEY ("action_questionId") REFERENCES "FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateQuestion" ADD CONSTRAINT "TemplateQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateQuestionOption" ADD CONSTRAINT "TemplateQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TemplateQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateConditionalLogic" ADD CONSTRAINT "TemplateConditionalLogic_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateConditionalLogic" ADD CONSTRAINT "TemplateConditionalLogic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TemplateQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateConditionalLogic" ADD CONSTRAINT "TemplateConditionalLogic_action_questionId_fkey" FOREIGN KEY ("action_questionId") REFERENCES "TemplateQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
