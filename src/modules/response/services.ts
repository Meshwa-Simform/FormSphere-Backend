import prisma from '../../configs/db.config.ts';
import cloudinary from '../../configs/cloudinary.config.ts';
import { InputAnswer, inputResponse } from './types.ts';

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

  // Create response and answers
  const createdResponse = await prisma.response.create({
    data: {
      userId: userID,
      userName: user.name,
      userEmail: user.email,
      form: { connect: { id: formId } },
      answers: {
        create: answers.map((a: InputAnswer) => ({
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

export const getAllResponsesService = async (formId: string) => {
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
      { userName: { contains: search, mode: 'insensitive' as const } },
      { userEmail: { contains: search, mode: 'insensitive' as const } },
      {
        answers: {
          some: {
            OR: [
              { questionAnswer: { contains: search, mode: 'insensitive' as const } },
              { responseAnswer: { contains: search, mode: 'insensitive' as const } },
            ],
          },
        },
      },
    ];
  }

  const allowedSortFields = ['createdAt', 'userName', 'userEmail'];
  const orderBy = allowedSortFields.includes(sortBy)
    ? { [sortBy]: sortOrder }
    : { createdAt: 'desc' as 'asc' | 'desc' };

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where,
      include: { answers: true },
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.response.count({ where }),
  ]);
  return { responses, total };
};
