import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtPayloadIsValid = (value: JwtPayload | string): value is JwtPayload => {
  return (value as JwtPayload).id !== undefined;
}

export interface AuthorizedRequest extends Request {
  userId?: string
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Servidor sem segredo configurado' });
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Token de autenticação não encontrado" });

  const parts = authHeader.split(" ");

  if (parts.length !== 2)
    return res.status(401).json({ message: "Token de autenticação corrompido ou mal formatado" });

  const [scheme, token] = parts;
  const regexValidator = /^Bearer$/i;

  if (!regexValidator.test(scheme))
    return res.status(401).json({ message: "Token de autenticação corrompido ou mal formatado" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded || !jwtPayloadIsValid(decoded)) return res.status(401).send({ message: 'Token de autenticação inválido' });

    (req as AuthorizedRequest).userId = decoded.id;
    return next();
  });
}