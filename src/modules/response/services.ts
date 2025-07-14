import prisma from '../../configs/db.config.ts';
import cloudinary from '../../configs/cloudinary.config.ts';
import { InputAnswer, inputResponse, Responses, ResponseWithAnswers } from './types.ts';

export const createResponseService = async (formData: inputResponse, userID: string) => {
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

  const latestVersion = await prisma.formVersion.findFirst({
    where: { formId },
    orderBy: { version: 'desc' },
  });
  if (!latestVersion) throw new Error('Form version not found');

  // Create response and answers
  const createdResponse = await prisma.response.create({
    data: {
      userId: userID,
      formId,
      formVersionId: latestVersion.id,
      answers: {
        create: answers.map((a: InputAnswer) => ({
          questionId: a.questionId,
          responseAnswer: a.responseAnswer,
        })),
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  return transformResponseToOutput(createdResponse);
};

export const getAllResponsesService = async (formId: string) => {
  const responses = await prisma.response.findMany({
    where: {
      formId: formId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  return responses.map(transformResponseToOutput);
};

export const uploadFileService = async (file: Express.Multer.File): Promise<string> => {
  try {
    if (!file || !file.buffer) {
      throw new Error('Invalid file data');
    }

    // Upload the file to Cloudinary
    const uploadResult = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'formSphere' }, // Automatically detect file type (image, video, etc.)
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload error: ${error.message}`));
          } else {
            resolve(result?.secure_url || '');
          }
        },
      );
      uploadStream.end(file.buffer);
    });

    console.log(`File uploaded successfully: ${uploadResult}`);
    return uploadResult;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new Error('Failed to upload file');
  }
};

export const getFormById = async (formId: string) => {
  const form = await prisma.form.findUnique({
    where: {
      id: formId,
    },
  });

  return form;
};

export const getResponsesService = async (
  formId: string,
  page: number,
  pageSize: number,
  search: string,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
) => {
  const skip = (page - 1) * pageSize;
  const where: {
    formId: string;
    OR?: any[];
  } = {
    formId,
  };

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      {
        answers: {
          some: {
            responseAnswer: { contains: search, mode: 'insensitive' },
          },
        },
      },
    ];
  }

  // Handle nested sorting properly
  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'name' || sortBy === 'email') {
    orderBy = {
      user: {
        [sortBy]: sortOrder,
      },
    };
  } else if (sortBy === 'createdAt') {
    orderBy = { createdAt: sortOrder };
  }

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    }),
    prisma.response.count({ where }),
  ]);
  return { responses: responses.map(transformResponseToOutput), total };
};

export const transformResponseToOutput = (response: ResponseWithAnswers): Responses => {
  return {
    id: response.id,
    userId: response.userId,
    userName: response.user.name,
    userEmail: response.user.email,
    formId: response.formId,
    createdAt: response.createdAt,
    answers: response.answers.map((a) => ({
      id: a.id,
      responseId: a.responseId,
      questionId: a.questionId,
      questionText: a.question.questionText,
      questionType: a.question.questionType,
      questionOptions: a.question.options.map((opt) => opt.optionText),
      questionAnswer: a.question.questionAnswer ?? '',
      questionOrder: a.question.questionOrder,
      responseAnswer: a.responseAnswer,
    })),
  };
};