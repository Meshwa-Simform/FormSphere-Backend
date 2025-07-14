import { Request, Response } from 'express';
import { handleError, handleResponse } from '../../utils/responseHandling.utils.ts';
import { verifyToken } from '../../utils/jwt.utils.ts';
import {
  createResponseService,
  getFormById,
  getAllResponsesService,
  uploadFileService,
  getResponsesService, // use the unified service
} from './services.ts';
import { Responses } from './types.ts';

export const createResponse = async (req: Request, res: Response) => {
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }

  const formData = req.body;

  // Validate the incoming data
  if (!formData || formData.length === 0) {
    handleResponse(res, 400, 'Form data is required');
    return;
  }

  try {
    // Call the service to create a response
    const response = await createResponseService(formData, userID);
    handleResponse(res, 201, 'Response created successfully', response as Responses);
  } catch (error) {
    console.error('Error creating response:', error);
    handleResponse(res, 500, 'Failed to create response');
  }
};

export const getAllResponses = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const formId = id;
  // Validate the incoming data
  if (!formId) {
    handleResponse(res, 400, 'Form ID is required');
    return;
  }
  try {
    // Check if the user has access to the form
    const form = await getFormById(formId);
    if (form?.userId !== userID) {
      handleResponse(res, 403, 'You do not have access to this form');
      return;
    }
    // Call the service to get responses
    const responses = await getAllResponsesService(formId);
    if (!responses || responses.length === 0) {
      handleResponse(res, 404, 'No responses found');
      return;
    }
    handleResponse(res, 200, 'Responses found', responses as Responses[]);
  } catch (error) {
    console.error('Error getting responses:', error);
    handleResponse(res, 500, 'Failed to get responses');
  }
};

// Merged controller for paginated and search/sort responses
export const getResponses = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) return;

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const search = (req.query.search as string) || '';
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  try {
    const form = await getFormById(id);
    if (form?.userId !== userID) {
      handleResponse(res, 403, 'You do not have access to this form');
      return;
    }

    const result = await getResponsesService(id, page, pageSize, search, sortBy, sortOrder);

    handleResponse(res, 200, 'Responses found', { ...result, page, pageSize });
  } catch (error) {
    console.error('Error getting responses:', error);
    handleResponse(res, 500, 'Failed to get responses');
  }
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

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      handleResponse(res, 400, 'No file uploaded');
      return;
    }

    // Call the service to upload the file to Cloudinary
    const fileUrl = await uploadFileService(file);

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    handleError(res, 500, 'Failed to upload file', error as Error);
  }
};