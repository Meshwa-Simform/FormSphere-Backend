import { Router } from 'express';
import { createForm, deleteForm, getFormById, updateForm, getForms } from './controllers.ts';

const router = Router();

router.get('/', getForms);
router.get('/:id', getFormById);
router.post('/create', createForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

export default router;
