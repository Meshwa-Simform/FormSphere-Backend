import {
  LogicAction,
  LogicCondition,
  Prisma,
  TemplateConditionalLogic,
  TemplateQuestion,
  TemplateQuestionOption,
  Templates,
} from '@prisma/client';
import prisma from '../../configs/db.config.ts';
import {
  ConditionalLogic,
  Template,
  TemplateOutput,
  TemplateQuestion as question,
} from './types.ts';

export const createTemplateService = async (templateData: Template) => {
  const { questions, styling, ...templateDetails } = templateData;

  const createdTemplate = await prisma.templates.create({
    data: {
      title: templateDetails.title,
      description: templateDetails.description,
      logoUrl: templateDetails.logoUrl ?? null,
      noOfPages: templateDetails.noOfPages ?? 1,
      styling: styling
        ? {
            pageColor: styling.pageColor,
            pageImage: styling.pageImage || null,
            formColor: styling.formColor,
            fontColor: styling.fontColor,
            fontFamily: styling.fontFamily,
            fontSize: styling.fontSize,
          }
        : {},
      questions: {
        create: questions.map((q) => ({
          pageNumber: q.pageNumber,
          questionType: q.questionType,
          questionText: q.questionText,
          validations: q.validations as Prisma.InputJsonValue,
          questionOrder: q.questionOrder,
          condition:
            q.condition && Object.values(LogicCondition).includes(q.condition as LogicCondition)
              ? (q.condition as LogicCondition)
              : null,
          action:
            q.action && Object.values(LogicAction).includes(q.action as LogicAction)
              ? (q.action as LogicAction)
              : null,
          options: {
            create: (q.questionOptions ?? []).map((opt) => ({
              optionText: opt,
            })),
          },
        })),
      },
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  // Create Conditional Logic using real UUIDs
  const createdLogic: ConditionalLogic[] = await createConditionalLogicForQuestions(
    createdTemplate.id,
    questions,
    createdTemplate.questions,
    prisma,
  );

  // Return full form with questions and logic
  return transformTemplateToOutput({
    ...createdTemplate,
    questions: createdTemplate.questions.map((q) => ({
      ...q,
      questionOptions: q.options?.map((opt) => opt.optionText) || [],
      conditionalLogic: createdLogic.filter((cl) => cl.questionId === q.id),
      options: q.options,
      templateConditionalLogic: [],
    })),
  });
};

export const getTemplatesService = async () => {
  const templates = await prisma.templates.findMany({
    include: {
      questions: {
        include: {
          options: true,
          templateConditionalLogic: true,
        },
      },
    },
  });
  return templates.map(transformTemplateToOutput);
};

export const getTemplateByIdService = async (templateId: string) => {
  const template = await prisma.templates.findUnique({
    where: {
      id: templateId,
    },
    include: {
      questions: {
        include: {
          options: true,
          templateConditionalLogic: true,
        },
      },
    },
  });
  if (!template) {
    return null;
  }
  return transformTemplateToOutput(template);
};

async function createConditionalLogicForQuestions(
  templateId: string,
  questions: question[],
  createdQuestions: question[],
  prismaInstance: Prisma.TransactionClient,
) {
  const createdLogic: ConditionalLogic[] = [];
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const createdQuestion = createdQuestions[i];

    if (
      question.conditionalLogic &&
      Array.isArray(question.conditionalLogic) &&
      question.conditionalLogic.length > 0
    ) {
      for (const cl of question.conditionalLogic) {
        for (const actionId of cl.action_questionId) {
          const actionQuestion = createdQuestions.find(
            (q) => q.questionOrder.toString() === actionId,
          );
          if (!actionQuestion || !actionQuestion.id) continue;

          const logic = await prismaInstance.templateConditionalLogic.create({
            data: {
              templateId,
              questionId: createdQuestion.id!,
              operator: cl.operator,
              value: cl.value,
              action_questionId: actionQuestion.id,
            },
          });
          createdLogic.push(logic);
        }
      }
    }
  }
  return createdLogic;
}

export const transformTemplateToOutput = (
  template: Templates & {
    questions: (TemplateQuestion & {
      options: TemplateQuestionOption[];
      templateConditionalLogic: TemplateConditionalLogic[];
    })[];
  },
): TemplateOutput => {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    logoUrl: template.logoUrl ?? null,
    noOfPages: template.noOfPages,
    styling: template.styling ?? null,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    questions: template.questions.map((q) => ({
      id: q.id,
      formId: null,
      templateId: q.templateId,
      pageNumber: q.pageNumber,
      questionType: q.questionType,
      questionText: q.questionText,
      questionOptions: q.options.map((opt) => opt.optionText),
      validations: q.validations,
      questionAnswer: q.questionAnswer ?? null,
      questionOrder: q.questionOrder,
      ConditionalLogic: (q.templateConditionalLogic ?? []).map((cl) => ({
        id: cl.id ?? '',
        templateId: cl.templateId ?? '',
        questionId: cl.questionId ?? '',
        operator: cl.operator,
        value: cl.value,
        action_questionId: [cl.action_questionId],
      })),
    })),
  };
};