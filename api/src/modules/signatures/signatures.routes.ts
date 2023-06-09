import { Router } from 'express';
import { authMiddleware } from '../users/users.middleware';
import { deleteSignatureAsset, listUserAssets, signDocument, uploadSignatureAsset } from './signatures.service';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})
router.get('/assets', authMiddleware, listUserAssets);

router.post('/sign', authMiddleware, signDocument);
router.post('/assets/upload', authMiddleware, uploadSignatureAsset);

router.delete('/assets/delete', authMiddleware, deleteSignatureAsset)

export default router;