import prisma from '../../configs/db.config.ts';
import { Prisma } from '@prisma/client';
import { ConditionalLogic, Form, Question } from './types.ts';

export const findFormById = async (formID: string) => {
  const form = await prisma.form.findUnique({
    where: {
      id: formID,
    },
    include: {
      questions: {
        include: {
          ConditionalLogic: true,
        },
      },
    },
  });
  return form;
};

export const findForms = async (userId: string) => {
  const forms = await prisma.form.findMany({
    where: {
      userId: userId,
    },
  });
  return forms;
};

export const generateForm = async (formData: Form, userId: string) => {
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
        title: formDetails.title,
        description: formDetails.description,
        logoUrl: formDetails.logoUrl || null,
        isSinglePage: formDetails.isSinglePage,
        noOfPages: formDetails.noOfPages,
        privateSharingToken: formDetails.privateSharingToken || null,
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
        questions: {
          create: questions.map((q) => ({
            pageNumber: q.pageNumber,
            questionType: q.questionType,
            questionText: q.questionText,
            questionOptions: q.questionOptions,
            validations: q.validations,
            questionOrder: q.questionOrder,
            isRequired: q.isRequired ?? false,
            isHidden: q.isHidden ?? false,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    // Create Conditional Logic using real UUIDs
    const createdLogic: ConditionalLogic[] = await createConditionalLogicForQuestions(
      createdForm.id,
      questions,
      createdForm.questions.map((q) => ({
        ...q,
        formId: q.formId === null ? undefined : q.formId,
        templateId: q.templateId === null ? undefined : q.templateId,
        questionAnswer: q.questionAnswer === null ? undefined : q.questionAnswer,
      })),
      prisma,
    );

    // Return full form with questions and logic
    return {
      ...createdForm,
      questions: createdForm.questions.map((q) => ({
        ...q,
        conditionalLogic: createdLogic.filter((cl) => cl.questionId === q.id),
      })),
    };
  });
};

export const updateFormbyId = async (formId: string, formData: Form, userId: string) => {
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

    // Delete existing questions and conditional logic
    await prisma.conditionalLogic.deleteMany({ where: { formId } });
    await prisma.question.deleteMany({ where: { formId } });

    // Update basic form info
    const updatedForm = await prisma.form.update({
      where: { id: formId, userId },
      data: {
        title: formDetails.title,
        description: formDetails.description,
        logoUrl: formDetails.logoUrl || null,
        isSinglePage: formDetails.isSinglePage,
        noOfPages: formDetails.noOfPages,
        privateSharingToken: formDetails.privateSharingToken || null,
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
        questions: {
          create: questions.map((q: Question) => ({
            pageNumber: q.pageNumber,
            questionType: q.questionType,
            questionText: q.questionText,
            questionOptions: q.questionOptions,
            validations: q.validations,
            questionOrder: q.questionOrder,
            isRequired: q.isRequired ?? false,
            isHidden: q.isHidden ?? false,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
    // Create Conditional Logic using real UUIDs
    const createdLogic: ConditionalLogic[] = await createConditionalLogicForQuestions(
      updatedForm.id,
      questions,
      updatedForm.questions.map((q) => ({
        ...q,
        formId: q.formId === null ? undefined : q.formId,
        templateId: q.templateId === null ? undefined : q.templateId,
        questionAnswer: q.questionAnswer === null ? undefined : q.questionAnswer,
      })),
      prisma,
    );

    // Return full form with questions and logic
    return {
      ...updatedForm,
      questions: updatedForm.questions.map((q) => ({
        ...q,
        conditionalLogic: createdLogic.filter((cl) => cl.questionId === q.id),
      })),
    };
  });
};

export const deleteFormbyId = async (formID: string, userId: string) => {
  const existingForm = await findFormById(formID);
  if (!existingForm) {
    throw new Error('Form not found');
  }
  if (existingForm.userId !== userId) {
    throw new Error('Unauthorized');
  }
  const form = await prisma.form.delete({
    where: {
      id: formID,
      userId: userId,
    },
  });
  return form;
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
    where.title = { contains: search, mode: 'insensitive' };
  }
  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.form.count({ where }),
  ]);
  return { forms, total };
};

// Helper function for creating conditional logic for questions
async function createConditionalLogicForQuestions(
  formId: string,
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
        cl.action_questionId = cl.action_questionId
          .map((id: string) => {
            const actionQuestion = createdQuestions.find((q) => q.questionOrder.toString() === id);
            if (actionQuestion) {
              return actionQuestion.id;
            }
            return '';
          })
          .filter((id): id is string => typeof id === 'string' && id !== ''); // Filter out empty strings
        if (!createdQuestion.id) {
          throw new Error('Invalid question ID for conditional logic');
        }
        const logic = await prismaInstance.conditionalLogic.create({
          data: {
            formId: formId,
            questionId: createdQuestion.id as string,
            condition_check: cl.condition_check,
            action_questionId: cl.action_questionId,
          },
        });
        createdLogic.push(logic);
      }
    }
  }
  return createdLogic;
}
