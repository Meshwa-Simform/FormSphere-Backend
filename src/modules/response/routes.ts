import { Router } from 'express';
import { createResponse, getResponses } from './controllers.ts';

const router = Router();

router.post('/create', createResponse);
router.get('/:id', getResponses);

export default router;
