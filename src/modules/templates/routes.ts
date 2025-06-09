import { Router } from 'express';
import { createTemplate, getTemplates, getTemplateById } from './controllers.ts';

const router = Router();

router.get('/', getTemplates);
router.post('/create', createTemplate);
router.get('/:id', getTemplateById);

export default router;
