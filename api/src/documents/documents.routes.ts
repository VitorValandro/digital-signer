import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { createDocument, uploadDocument } from './documents.service';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})

router.post('/', authMiddleware, createDocument);
router.post('/upload', authMiddleware, uploadDocument);

export default router;