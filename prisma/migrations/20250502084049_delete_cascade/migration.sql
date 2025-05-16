-- DropForeignKey
ALTER TABLE "ConditionalLogic" DROP CONSTRAINT "ConditionalLogic_formId_fkey";

-- DropForeignKey
ALTER TABLE "ConditionalLogic" DROP CONSTRAINT "ConditionalLogic_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_formId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_formId_fkey";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalLogic" ADD CONSTRAINT "ConditionalLogic_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalLogic" ADD CONSTRAINT "ConditionalLogic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
