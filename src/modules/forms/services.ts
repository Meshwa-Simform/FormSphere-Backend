import prisma from '../../configs/db.config.ts';
import { ConditionalLogic, Form } from './types.ts';

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
            create: {
              PageColor: styling.PageColor,
              PageImage: styling.PageImage || null,
              formColor: styling.formColor,
              fontColor: styling.fontColor,
              fontFamily: styling.fontFamily,
              fontSize: styling.fontSize,
            },
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
  const createdLogic: ConditionalLogic[] = [];
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const createdQuestion = createdForm.questions[i];

    if (
      question.conditionalLogic &&
      Array.isArray(question.conditionalLogic) &&
      question.conditionalLogic.length > 0
    ) {
      for (const cl of question.conditionalLogic) {
        cl.action_questionId = cl.action_questionId
          .map((id: string) => {
            const actionQuestion = createdForm.questions.find(
              (q) => q.questionOrder.toString() === id,
            );
            if (actionQuestion) {
              return actionQuestion.id;
            }
            return '';
          })
          .filter((id) => id !== ''); // Filter out empty strings
        const logic = await prisma.conditionalLogic.create({
          data: {
            formId: createdForm.id,
            questionId: createdQuestion.id,
            condition_check: cl.condition_check,
            action_questionId: cl.action_questionId,
          },
        });
        createdLogic.push(logic);
      }
    }
  }

  // Return full form with questions and logic
  return {
    ...createdForm,
    questions: createdForm.questions.map((q) => ({
      ...q,
      conditionalLogic: createdLogic.filter((cl) => cl.questionId === q.id),
    })),
  };
};
