import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { createDocument, getDocumentToSignById, listDocumentsByUser, uploadDocument } from './documents.service';

const router = Router();

router.get('/', authMiddleware, listDocumentsByUser);
router.get('/:id', authMiddleware, getDocumentToSignById);

router.post('/', authMiddleware, createDocument);
router.post('/upload', authMiddleware, uploadDocument);

export default router;