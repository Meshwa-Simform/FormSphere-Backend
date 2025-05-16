import { Request, Response } from 'express';
import { handleFormResponse } from '../../utils/responseHandling.utils.ts';
import { verifyToken } from '../../utils/jwt.utils.ts';
import { createResponseService, getFormById, getResponsesService } from './services.ts';
import { Responses } from './types.ts';

export const createResponse = async (req: Request, res: Response) => {
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }

  const formData = req.body;

  // Validate the incoming data
  if (!formData || formData.length === 0) {
    handleFormResponse(res, 400, 'Form data is required');
    return;
  }

  try {
    // Call the service to create a response
    console.log(formData);
    const response = await createResponseService(formData, userID);
    handleFormResponse(res, 201, 'Response created successfully', response as Responses);
  } catch (error) {
    console.error('Error creating response:', error);
    handleFormResponse(res, 500, 'Failed to create response');
  }
};

export const getResponses = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = await getUserId(req, res);
  if (!userID) {
    return;
  }
  const formId = id;
  // Validate the incoming data
  if (!formId) {
    handleFormResponse(res, 400, 'Form ID is required');
    return;
  }
  try {
    // Check if the user has access to the form
    const form = await getFormById(formId);
    if (form?.userId !== userID) {
      handleFormResponse(res, 403, 'You do not have access to this form');
      return;
    }
    // Call the service to get responses
    const responses = await getResponsesService(formId);
    if (!responses || responses.length === 0) {
      handleFormResponse(res, 404, 'No responses found');
      return;
    }
    handleFormResponse(res, 200, 'Responses found', responses as Responses[]);
  } catch (error) {
    console.error('Error getting responses:', error);
    handleFormResponse(res, 500, 'Failed to get responses');
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
