
-- Insert old Form data into FormVersion table
INSERT INTO "FormVersion" (
  "id", "formId", "version", "title", "description", "logoUrl",
  "noOfPages", "styling", "status", "accessType", "lastDate",
  "allowMultipleSubmissions", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(), "id", 1, "title", "description", "logoUrl",
  "noOfPages", "styling", 'draft', 'public', NULL, TRUE, "createdAt", "updatedAt"
FROM "Form";

-- Insert old Questions data into FormQuestions table
INSERT INTO "FormQuestion" (
  "id", "formVersionId", "pageNumber", "questionType",
  "questionText", "validations", "questionAnswer",
  "questionOrder", "condition", "action", "createdAt"
)
SELECT
  q.id,
  fv.id,                             -- Get new formVersionId
  q."pageNumber",
  q."questionType",
  q."questionText",
  q."validations",
  q."questionAnswer",
  q."questionOrder",
  CASE
    WHEN q."condition" IN ('and', 'or') THEN q."condition"::"LogicCondition"
    ELSE NULL
  END,
  CASE
    WHEN q."action" IN ('show', 'hide') THEN q."action"::"LogicAction"
    ELSE NULL
  END,
  fv."createdAt"
FROM "Question" q
JOIN "FormVersion" fv ON fv."formId" = q."formId"
WHERE q."formId" IS NOT NULL;

-- Insert Questions.options in FormQuestionOptions
INSERT INTO "FormQuestionOption" ("id", "questionId", "optionText")
SELECT
  gen_random_uuid(),              -- Generate new ID for each option
  q.id,                           -- Same ID as questionId (from old Question table)
  option_text
FROM (
  SELECT
    id,
    unnest("questionOptions") AS option_text
  FROM "Question"
  WHERE "formId" IS NOT NULL
) AS q;

-- Insert ConditionalLogic in FormConditionalLogic
INSERT INTO "FormConditionalLogic" (
  "id", "formVersionId", "questionId", "operator",
  "value", "action_questionId", "createdAt"
)
SELECT
  cl.id,
  fv.id,                       -- get formVersionId from FormVersion
  cl."questionId",
  cl."operator",
  cl."value",
  cl."action_questionId"[1]::UUID,
  fv."createdAt"
FROM "ConditionalLogic" cl
JOIN "FormVersion" fv ON fv."formId" = cl."formId";


-- Set formVersionId in Response based on matching formId
UPDATE "Response"
SET "formVersionId" = fv."id"
FROM (
  SELECT "id", "formId"
  FROM "FormVersion"
) AS fv
WHERE "Response"."formId" = fv."formId";
-- update Response.formVersionId to not null
ALTER TABLE "Response"
ALTER COLUMN "formVersionId" SET NOT NULL;


-- Insert Template Question in TemplateQuestion
INSERT INTO "TemplateQuestion" (
  "id", "templateId", "pageNumber", "questionType", "questionText",
  "questionAnswer", "validations", "questionOrder", "condition", "action"
)
SELECT
  q."id",
  q."templateId",
  q."pageNumber",
  q."questionType",
  q."questionText",
  COALESCE(q."questionAnswer", ''),
  q."validations",
  q."questionOrder",
  CASE
    WHEN q."condition" IN ('and', 'or') THEN q."condition"::"LogicCondition"
    ELSE NULL
  END,
  CASE
    WHEN q."action" IN ('show', 'hide') THEN q."action"::"LogicAction"
    ELSE NULL
  END
FROM "Question" q
JOIN "Templates" t ON t."id" = q."templateId"
WHERE q."templateId" IS NOT NULL;

-- Insert Template Question Options in TemplateQuestionOption
INSERT INTO "TemplateQuestionOption" (
  "id", "questionId", "optionText"
)
SELECT
  gen_random_uuid(),
  q.id, -- Question ID (same as templateQuestionId)
  option_text
FROM (
  SELECT "id", unnest("questionOptions") AS option_text
  FROM "Question"
  WHERE "templateId" IS NOT NULL
) AS q;


ALTER TABLE "Answer"
ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion" ("id") ON DELETE CASCADE;
