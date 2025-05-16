import { Request, Response } from 'express';
import { createTemplateService, getTemplatesService, getTemplateByIdService } from './services.ts';
import { handleTemplateResponse } from '../../utils/responseHandling.utils.ts';

export const createTemplate = async (req: Request, res: Response) => {
  const templateData = req.body;

  if (!templateData.title || !templateData.questions || templateData.questions.length === 0) {
    handleTemplateResponse(res, 400, 'Template name and questions are required');
    return;
  }

  try {
    const template = await createTemplateService(templateData);
    handleTemplateResponse(res, 201, 'Template created successfully', template);
  } catch (error) {
    console.error('Error creating template:', error);
    handleTemplateResponse(res, 500, 'Failed to create template');
  }
};

export const getTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = await getTemplatesService();
    if (!templates || templates.length === 0) {
      handleTemplateResponse(res, 404, 'No templates found');
      return;
    }
    handleTemplateResponse(res, 200, 'Templates found', templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    handleTemplateResponse(res, 500, 'Failed to fetch templates');
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const template = await getTemplateByIdService(id);
    if (!template) {
      handleTemplateResponse(res, 404, 'Template not found');
      return;
    }
    handleTemplateResponse(res, 200, 'Template found', template);
  } catch (error) {
    console.error('Error fetching template:', error);
    handleTemplateResponse(res, 500, 'Failed to fetch template');
  }
};
