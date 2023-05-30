import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { createDocument, listDocumentsByUser, uploadDocument } from './documents.service';

const router = Router();

router.get('/', authMiddleware, listDocumentsByUser)

router.post('/', authMiddleware, createDocument);
router.post('/upload', authMiddleware, uploadDocument);

export default router;