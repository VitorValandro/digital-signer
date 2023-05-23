import { Router } from 'express';
import { createUser, findUserByEmail, login } from './users.service';
import { authMiddleware } from './users.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.send('Hello world');
})

router.get('/:email', findUserByEmail)

router.post('/', createUser);

router.post('/login', login);


export default router;