import { Router } from 'express';
import { createUser, findUserByEmail, login } from './users.service';
import { authMiddleware } from './users.middleware';

const router = Router();

router.get('/:email', authMiddleware, findUserByEmail)

router.post('/', createUser);

router.post('/login', login);


export default router;