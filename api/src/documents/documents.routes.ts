import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { createDocument } from './documents.service';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})

router.post('/', authMiddleware, createDocument);

export default router;