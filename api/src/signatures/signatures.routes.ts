import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { signDocument, uploadSignatureAsset } from './signatures.service';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})

router.post('/sign', authMiddleware, signDocument);
router.post('/assets/upload', authMiddleware, uploadSignatureAsset);

export default router;