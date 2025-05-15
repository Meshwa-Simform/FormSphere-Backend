import { Request, Response } from 'express';
import { findFormById, findForms, generateForm } from './services.ts';
import { verifyToken } from '../../utils/jwt.utils.ts';
import { handleFormResponse } from '../../utils/responseHandling.utils.ts';
import { FormOutput } from './types.ts';

export const getFormById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const form = await findFormById(id);
  if (!form) {
    handleFormResponse(res, 404, 'Form not found');
    return;
  }
  handleFormResponse(res, 200, 'Form found', form as FormOutput);
};

export const getAllForms = async (req: Request, res: Response) => {
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const forms = await findForms(userID);
  if (!forms || forms.length === 0) {
    handleFormResponse(res, 404, 'No forms found');
    return;
  }
  handleFormResponse(res, 200, 'Forms found', forms as FormOutput[]);
};

export const createForm = async (req: Request, res: Response) => {
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const formData = req.body;

  // Validate the incoming data
  if (!formData.title || !formData.questions || formData.questions.length === 0) {
    handleFormResponse(res, 400, 'Form title and elements are required');
    return;
  }

  try {
    const form = await generateForm(formData, userID);
    const transformedForm = {
      ...form,
      questions: form.questions.map((question: any) => ({
        ...question,
        ConditionalLogic: question.conditionalLogic,
        isHidden: question.isHidden || false,
      })),
    };
    handleFormResponse(res, 201, 'Form created successfully', transformedForm as FormOutput);
  } catch (error) {
    console.error('Error creating form:', error);
    handleFormResponse(res, 500, 'Failed to create form');
  }
};

const getUserId = async (req: Request, res: Response) => {
  if (!req.cookies || !req.cookies.refreshToken) {
    handleFormResponse(res, 401, 'Refresh token is missing');
    return;
  }
  const token = req.cookies.refreshToken;
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === 'string') {
    handleFormResponse(res, 403, 'Invalid or expired refresh token');
    return;
  }
  return decoded.id;
};
