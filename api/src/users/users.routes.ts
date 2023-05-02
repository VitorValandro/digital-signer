import { Router } from 'express';
import { createUser, login } from './users.service';
import { authMiddleware } from './users.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})

router.post('/', createUser);

router.post('/login', login);


export default router;