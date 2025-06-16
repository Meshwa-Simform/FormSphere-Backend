import { Router } from 'express';
import { createForm, deleteForm, getAllForms, getFormById, updateForm } from './controllers.ts';

const router = Router();

router.get('/', getAllForms);
router.get('/:id', getFormById);
router.post('/create', createForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

export default router;
