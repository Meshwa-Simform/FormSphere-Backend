import { Router } from 'express';
import { createForm, getAllForms, getFormById } from './controllers.ts';

const router = Router();

router.get('/', getAllForms);
router.get('/:id', getFormById);
router.post('/create', createForm);

export default router;
