import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { signDocument } from './signatures.service';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})

router.post('/sign', authMiddleware, signDocument);

export default router;