import { Request, Response } from 'express';
import {
  deleteFormbyId,
  findFormById,
  generateForm,
  updateFormbyId,
  getFormsService,
} from './services.ts';
import { verifyToken } from '../../utils/jwt.utils.ts';
import { handleResponse } from '../../utils/responseHandling.utils.ts';
import { FormOutput } from './types.ts';

export const getFormById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const form = await findFormById(id);
  if (!form) {
    handleResponse(res, 404, 'Form not found');
    return;
  }
  handleResponse(res, 200, 'Form found', form as FormOutput);
};

export const getForms = async (req: Request, res: Response) => {
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const search = (req.query.search as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  try {
    const { forms, total } = await getFormsService(userID, search, page, pageSize);
    handleResponse(res, 200, 'Forms found', { forms, total, page, pageSize });
  } catch (error) {
    handleResponse(res, 500, 'Failed to fetch forms');
  }
};

export const createForm = async (req: Request, res: Response) => {
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const formData = req.body;

  // Validate the incoming data
  if (!formData.title || !formData.questions || formData.questions.length === 0) {
    handleResponse(res, 400, 'Form title and elements are required');
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
    handleResponse(res, 201, 'Form created successfully', transformedForm as FormOutput);
  } catch (error) {
    console.error('Error creating form:', error);
    handleResponse(res, 500, 'Failed to create form');
  }
};

export const updateForm = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const formData = req.body;
  if (!formData) {
    handleResponse(res, 400, 'Form data is required');
    return;
  }
  try {
    const form = await updateFormbyId(id, formData, userID);
    if (!form) {
      handleResponse(res, 400, 'Form update failed');
      return;
    }
    const transformedForm = {
      ...form,
      questions: form.questions.map((question: any) => ({
        ...question,
        ConditionalLogic: question.conditionalLogic,
        isHidden: question.isHidden || false,
      })),
    };
    handleResponse(res, 200, 'Form updated successfully', transformedForm as FormOutput);
  } catch (error: any) {
    handleResponse(res, 403, error.message || 'Unauthorized or not found');
  }
};

export const deleteForm = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const deletedForm = await deleteFormbyId(id, userID);
  if (!deletedForm) {
    handleResponse(res, 400, 'Form deletion failed');
    return;
  }
  handleResponse(res, 200, 'Form deleted successfully', deletedForm as FormOutput);
};

const getUserId = async (req: Request, res: Response) => {
  if (!req.cookies || !req.cookies.refreshToken) {
    handleResponse(res, 401, 'Refresh token is missing');
    return;
  }
  const token = req.cookies.refreshToken;
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === 'string') {
    handleResponse(res, 403, 'Invalid or expired refresh token');
    return;
  }
  return decoded.id;
};
