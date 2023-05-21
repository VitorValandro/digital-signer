import { z } from 'zod';
import { prisma } from '../../prisma-client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const createUser = async (req: Request, res: Response) => {
  const UserDto = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
  });

  type CreateUserDto = z.infer<typeof UserDto>;

  let user = req.body as CreateUserDto;
  try {
    user = UserDto.parse(user);
  }
  catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Formulário inválido' })
    return res.status(500).json({ error: err })
  }

  try {
    user.password = await bcrypt.hash(user.password, 12);
    await prisma.user.create({
      data: user
    });
  }
  catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError)
      if (err.code === 'P2002') return res.status(400).json({ message: 'Email já cadastrado' })

    return res.status(500).json({ error: err })
  }

  return res.status(200).json({ message: "Usuário criado com sucesso" })
}

export const login = async (req: Request, res: Response) => {
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Servidor sem segredo configurado' });
  const HOURS_TOKEN_VALIDATION = 8;

  const LoginDto = z.object({
    email: z.string().email(),
    password: z.string()
  });
  type LoginUserDto = z.infer<typeof LoginDto>;

  const dto = req.body as LoginUserDto;
  try {
    LoginDto.parse(dto);
  }
  catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Formulário inválido' });
    return res.status(500).json({ error: err });
  }

  const user = await prisma.user.findUnique({ where: { email: dto.email } });

  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

  if (!await bcrypt.compare(dto.password, user.password)) return res.status(400).json({ message: 'Senha incorreta' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: HOURS_TOKEN_VALIDATION * 3600 });

  return res.send({ user: { ...user, password: undefined }, token });
}