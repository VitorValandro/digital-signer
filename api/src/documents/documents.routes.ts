import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { createDocument, getDocumentToSignById, getDocumentToViewById, listDocumentsByUser, uploadDocument, verifyDocument } from './documents.service';

const router = Router();

router.get('/', authMiddleware, listDocumentsByUser);
router.get('/:id', authMiddleware, getDocumentToSignById);
router.get('/view/:id', authMiddleware, getDocumentToViewById);

router.post('/', authMiddleware, createDocument);
router.post('/upload', authMiddleware, uploadDocument);
router.post('/verify', verifyDocument);

export default router;