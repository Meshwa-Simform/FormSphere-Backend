import { Prisma } from '@prisma/client';
import prisma from '../../configs/db.config.ts';
import { Template } from './types.ts';

export const createTemplateService = async (templateData: Template) => {
  const { questions, styling, ...templateDetails } = templateData;

  const createdTemplate = await prisma.templates.create({
    data: {
      title: templateDetails.title,
      description: templateDetails.description,
      styling: {
        pageColor: styling?.pageColor ?? null,
        pageImage: styling?.pageImage ?? null,
        formColor: styling?.formColor ?? null,
        fontColor: styling?.fontColor ?? null,
        fontFamily: styling?.fontFamily ?? null,
        fontSize: styling?.fontSize ?? null,
      },
      questions: {
        create: questions.map((q) => ({
          pageNumber: q.pageNumber,
          questionType: q.questionType,
          questionText: q.questionText,
          questionOptions: q.questionOptions,
          validations: q.validations as Prisma.InputJsonValue,
          questionOrder: q.questionOrder,
          isRequired: q.isRequired ?? false,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  return createdTemplate;
};

export const getTemplatesService = async () => {
  const templates = await prisma.templates.findMany({
    include: {
      questions: true,
    },
  });
  return templates;
};

export const getTemplateByIdService = async (templateId: string) => {
  const template = await prisma.templates.findUnique({
    where: {
      id: templateId,
    },
    include: {
      questions: true,
    },
  });
  return template;
};
