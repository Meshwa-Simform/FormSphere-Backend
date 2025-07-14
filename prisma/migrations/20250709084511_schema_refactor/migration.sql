
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CREATE ENUMS (keep as is)
CREATE TYPE "FormStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "FormAccessType" AS ENUM ('public', 'private');
CREATE TYPE "LogicCondition" AS ENUM ('and', 'or');
CREATE TYPE "LogicAction" AS ENUM ('show', 'hide');

-- MODIFY EXISTING TABLES WITHOUT DROPPING DATA
ALTER TABLE "Response"
ADD COLUMN "formVersionId" UUID;

-- User table add createdAt
ALTER TABLE "User"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DROP FOREIGN KEYS
ALTER TABLE "ConditionalLogic" DROP CONSTRAINT IF EXISTS "ConditionalLogic_formId_fkey";
ALTER TABLE "ConditionalLogic" DROP CONSTRAINT IF EXISTS "ConditionalLogic_questionId_fkey";
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_formId_fkey";
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_templateId_fkey";
ALTER TABLE "Form" DROP CONSTRAINT IF EXISTS "Form_userId_fkey";

-- CREATE NEW TABLES
CREATE TABLE "FormAccess" (
    "id" UUID PRIMARY KEY NOT NULL,
    "formId" UUID NOT NULL,
    "email" TEXT NOT NULL
);

CREATE TABLE "FormVersion" (
    "id" UUID PRIMARY KEY NOT NULL,
    "formId" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "noOfPages" INTEGER NOT NULL DEFAULT 1,
    "styling" JSONB,
    "status" "FormStatus" NOT NULL,
    "accessType" "FormAccessType" NOT NULL,
    "lastDate" TIMESTAMP(3),
    "allowMultipleSubmissions" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "FormQuestion" (
    "id" UUID PRIMARY KEY NOT NULL,
    "formVersionId" UUID NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "validations" JSONB NOT NULL DEFAULT '{}',
    "questionAnswer" TEXT,
    "questionOrder" INTEGER NOT NULL,
    "condition" "LogicCondition",
    "action" "LogicAction",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "FormQuestionOption" (
    "id" UUID PRIMARY KEY NOT NULL,
    "questionId" UUID NOT NULL,
    "optionText" TEXT NOT NULL
);

CREATE TABLE "FormConditionalLogic" (
    "id" UUID PRIMARY KEY NOT NULL,
    "formVersionId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "action_questionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "TemplateQuestion" (
    "id" UUID PRIMARY KEY NOT NULL,
    "templateId" UUID NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionAnswer" TEXT,
    "validations" JSONB NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "condition" "LogicCondition",
    "action" "LogicAction"
);

CREATE TABLE "TemplateQuestionOption" (
    "id" UUID PRIMARY KEY NOT NULL,
    "questionId" UUID NOT NULL,
    "optionText" TEXT NOT NULL
);

CREATE TABLE "TemplateConditionalLogic" (
    "id" UUID PRIMARY KEY NOT NULL,
    "templateId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "action_questionId" UUID NOT NULL
);

-- ADD FOREIGN KEYS
ALTER TABLE "FormAccess"
ADD CONSTRAINT "FormAccess_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE;

ALTER TABLE "Form"
ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE;

ALTER TABLE "FormQuestion"
ADD CONSTRAINT "FormQuestion_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion" ("id") ON DELETE CASCADE;

ALTER TABLE "FormQuestionOption"
ADD CONSTRAINT "FormQuestionOption_formQuestionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion" ("id") ON DELETE CASCADE;

ALTER TABLE "FormConditionalLogic"
ADD CONSTRAINT "FormConditionalLogic_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion" ("id") ON DELETE CASCADE;

ALTER TABLE "FormConditionalLogic"
ADD CONSTRAINT "FormConditionalLogic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion" ("id") ON DELETE CASCADE;

ALTER TABLE "FormConditionalLogic"
ADD CONSTRAINT "FormConditionalLogic_action_questionId_fkey" FOREIGN KEY ("action_questionId") REFERENCES "FormQuestion" ("id") ON DELETE CASCADE;

ALTER TABLE "Response"
ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE;

ALTER TABLE "Response"
ADD CONSTRAINT "Response_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion" ("id") ON DELETE CASCADE;

ALTER TABLE "TemplateQuestion"
ADD CONSTRAINT "TemplateQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates" ("id") ON DELETE CASCADE;

ALTER TABLE "TemplateQuestionOption"
ADD CONSTRAINT "TemplateQuestionOption_templateQuestionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TemplateQuestion" ("id") ON DELETE CASCADE;

ALTER TABLE "TemplateConditionalLogic"
ADD CONSTRAINT "TemplateConditionalLogic_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates" ("id") ON DELETE CASCADE;

ALTER TABLE "TemplateConditionalLogic"
ADD CONSTRAINT "TemplateConditionalLogic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TemplateQuestion" ("id") ON DELETE CASCADE;

ALTER TABLE "TemplateConditionalLogic"
ADD CONSTRAINT "TemplateConditionalLogic_action_questionId_fkey" FOREIGN KEY ("action_questionId") REFERENCES "TemplateQuestion" ("id") ON DELETE CASCADE;
