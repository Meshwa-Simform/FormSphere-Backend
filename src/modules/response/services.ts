import prisma from '../../configs/db.config.ts';

export const createResponseService = async (formData: any, userID: string) => {
  const { answers, formId } = formData;

  if (!formId || !answers || answers.length === 0) {
    throw new Error('Form ID and answers are required');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userID,
    },
  });
  if (!user) {
    throw new Error('User not found');
  }

  // Create response and answers
  const createdResponse = await prisma.response.create({
    data: {
      userId: userID,
      userName: user.name,
      userEmail: user.email,
      form: { connect: { id: formId } },
      answers: {
        create: answers.map((a: any) => ({
          questionId: a.questionId,
          questionText: a.questionText,
          questionType: a.questionType,
          questionOptions: a.questionOptions,
          questionAnswer: a.questionAnswer,
          questionOrder: a.questionOrder,
          responseAnswer: a.responseAnswer,
        })),
      },
    },
    include: {
      answers: true,
    },
  });

  return createdResponse;
};

export const getResponsesService = async (formId: string) => {
  const responses = await prisma.response.findMany({
    where: {
      formId: formId,
    },
    include: {
      answers: true,
    },
  });

  return responses;
};

export const getFormById = async (formId: string) => {
  const form = await prisma.form.findUnique({
    where: {
      id: formId,
    },
  });

  return form;
};
