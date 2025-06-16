import { Router } from 'express';
import multer from 'multer';
import { createResponse, getResponses, uploadFile } from './controllers.ts';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define the route for file uploads
router.post('/upload', upload.single('file'), uploadFile);

router.post('/create', createResponse);
router.get('/:id', getResponses);

export default router;
