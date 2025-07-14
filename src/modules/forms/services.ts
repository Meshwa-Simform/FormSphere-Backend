import prisma from '../../configs/db.config.ts';
import { FormAccessType, LogicAction, LogicCondition, Prisma } from '@prisma/client';
import { ConditionalLogic, Form, FormInput, FormOutput, Question, Styling } from './types.ts';
import { FormStatus } from '@prisma/client';

export const findFormById = async (formId: string) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      formVersion: {
        orderBy: { version: 'desc' },
        take: 1,
        include: {
          questions: {
            include: {
              options: true,
              conditionalLogic: true,
            },
          },
        },
      },
    },
  });

  if (!form || form.formVersion.length === 0) return null;

  return transformFormToOutput(form);
};

export const generateForm = async (formData: FormInput, userId: string) => {
  const { questions, styling, ...formDetails } = formData;

  if (!formDetails.title || !questions || questions.length === 0) {
    throw new Error('Form title and questions are required');
  }

  // Transaction to ensure atomicity
  return await prisma.$transaction(async (prisma) => {
    // Create form and questions
    const createdForm = await prisma.form.create({
      data: {
        userId,
      },
    });
    const formVersion = await prisma.formVersion.create({
      data: {
        formId: createdForm.id,
        version: 1,
        title: formDetails.title,
        description: formDetails.description,
        logoUrl: formDetails.logoUrl ?? null,
        noOfPages: formDetails.noOfPages,
        styling: styling
          ? {
              pageColor: styling.pageColor,
              pageImage: styling.pageImage || null,
              formColor: styling.formColor,
              fontColor: styling.fontColor,
              fontFamily: styling.fontFamily,
              fontSize: styling.fontSize,
            }
          : undefined,
        status: (formDetails.status as FormStatus) ?? FormStatus.published,
        accessType: (formDetails.status as FormAccessType) ?? FormAccessType.public,
        questions: {
          create: questions.map((q) => ({
            pageNumber: q.pageNumber,
            questionType: q.questionType,
            questionText: q.questionText,
            questionAnswer: q.questionAnswer ?? null,
            validations: q.validations ?? {},
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
              create:
                q.questionOptions?.map((opt) => ({
                  optionText: opt,
                })) ?? [],
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
      formVersion.id,
      questions,
      formVersion.questions,
      prisma,
    );

    // Return full form with questions and logic
    return transformFormToOutput({
      ...createdForm,
      formVersion: [
        {
          ...formVersion,
          questions: formVersion.questions.map((q) => ({
            ...q,
            questionOptions: q.options?.map((opt) => opt.optionText) || [],
            conditionalLogic: createdLogic.filter((cl) => cl.questionId === q.id),
          })),
        },
      ],
    });
  });
};

export const updateFormbyId = async (formId: string, formData: FormInput, userId: string) => {
  const { questions, styling, ...formDetails } = formData;

  if (!formDetails.title || !questions || questions.length === 0) {
    throw new Error('Form title and questions are required');
  }

  // Transaction to ensure atomicity
  return await prisma.$transaction(async (prisma) => {
    // Check if form exists and belongs to the user
    const existingForm = await prisma.form.findUnique({
      where: {
        id: formId,
        userId: userId,
      },
    });
    if (!existingForm) {
      throw new Error('Unauthorized to update this form');
    }

    const latestVersion = await prisma.formVersion.findFirst({
      where: { formId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const newVersion = (latestVersion?.version ?? 0) + 1;

    const updatedVersion = await prisma.formVersion.create({
      data: {
        formId,
        version: newVersion,
        title: formDetails.title,
        description: formDetails.description,
        logoUrl: formDetails.logoUrl ?? null,
        noOfPages: formDetails.noOfPages,
        styling: styling
          ? {
              pageColor: styling.pageColor,
              pageImage: styling.pageImage || null,
              formColor: styling.formColor,
              fontColor: styling.fontColor,
              fontFamily: styling.fontFamily,
              fontSize: styling.fontSize,
            }
          : undefined,
        status: (formDetails.status as FormStatus) ?? FormStatus.published,
        accessType: (formDetails.status as FormAccessType) ?? FormAccessType.public,
        questions: {
          create: questions.map((q) => ({
            pageNumber: q.pageNumber,
            questionType: q.questionType,
            questionText: q.questionText,
            questionAnswer: q.questionAnswer ?? null,
            validations: q.validations ?? {},
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
              create:
                q.questionOptions?.map((opt) => ({
                  optionText: opt,
                })) ?? [],
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
      updatedVersion.id,
      questions,
      updatedVersion.questions,
      prisma,
    );

    // Return full form with questions and logic
    return transformFormToOutput({
      ...existingForm,
      formVersion: [
        {
          ...updatedVersion,
          questions: updatedVersion.questions.map((q) => ({
            ...q,
            questionOptions: q.options?.map((opt) => opt.optionText) || [],
            conditionalLogic: createdLogic.filter((cl) => cl.questionId === q.id),
          })),
        },
      ],
    });
  });
};

export const deleteFormbyId = async (formId: string, userId: string) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { userId: true },
  });

  if (!form || form.userId !== userId) {
    throw new Error('Unauthorized or form not found');
  }

  await prisma.form.delete({
    where: { id: formId },
  });

  return { message: 'Form deleted successfully' };
};

export const getFormsService = async (
  userId: string,
  search: string,
  page: number,
  pageSize: number,
) => {
  const skip = (page - 1) * pageSize;
  const where: any = { userId };
  if (search) {
    where.formVersion = {
      some: {
        title: { contains: search, mode: 'insensitive' },
      },
    };
  }

  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        formVersion: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            questions: {
              include: {
                options: true,
                conditionalLogic: true,
              },
            },
          },
        },
      },
    }),
    prisma.form.count({ where }),
  ]);
  return {
    forms: forms.map(transformFormToOutput),
    total,
  };
};

// Helper function for creating conditional logic for questions
async function createConditionalLogicForQuestions(
  formVersionId: string,
  questions: Question[],
  createdQuestions: Question[],
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

          const logic = await prismaInstance.formConditionalLogic.create({
            data: {
              formVersionId,
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

// Helper function for creating conditional logic for questions
function transformFormToOutput(form: Form): FormOutput {
  const latestVersion = form.formVersion[0];

  return {
    id: form.id ?? '',
    userId: form.userId ?? '',
    title: latestVersion.title,
    description: latestVersion.description,
    logoUrl: latestVersion.logoUrl ?? null,
    noOfPages: latestVersion.noOfPages,
    styling: latestVersion.styling
      ? typeof latestVersion.styling === 'object'
        ? (latestVersion.styling as Styling)
        : null
      : null,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    questions: latestVersion.questions.map((q) => ({
      id: q.id ?? null,
      formId: latestVersion.formId ?? null,
      templateId: null,
      validations: q.validations,
      pageNumber: q.pageNumber,
      questionType: q.questionType,
      questionText: q.questionText,
      questionAnswer: q.questionAnswer ?? null,
      questionOrder: q.questionOrder,
      action: q.action ?? null,
      condition: q.condition ?? null,
      questionOptions: q.options?.map((opt) => opt.optionText) ?? [],
      ConditionalLogic: (q.conditionalLogic ?? []).map((cl) => ({
        id: cl.id ?? '',
        formId: cl.formVersionId ?? '',
        questionId: cl.questionId ?? '',
        operator: cl.operator,
        value: cl.value,
        action_questionId: [cl.action_questionId],
      })),
    })),
  };
}
