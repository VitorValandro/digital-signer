import { z } from 'zod';
import { prisma } from '../../prisma-client';
import { Response } from 'express';
import { AuthorizedRequest } from '../users/users.middleware';

export const createDocument = async (req: AuthorizedRequest, res: Response) => {
  const DocumentDto = z.object({
    documentUrl: z.string().url(),
    signees: z
      .array(
        z.object({
          id: z.string().uuid(),
          quantity: z.number().default(1),
        })
      )
      .min(1),
  });

  type CreateDocumentDto = z.infer<typeof DocumentDto>;

  const documentData = req.body as CreateDocumentDto;

  try {
    DocumentDto.parse(documentData);
  }
  catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Formulário inválido' })
    return res.status(500).json({ error: err })
  }

  const userId = req.userId;

  const document = await prisma.document.create({
    data: {
      blankDocumentUrl: documentData.documentUrl,
      ownerId: userId
    },
  });

  await Promise.all(
    documentData.signees.map(async ({ id, quantity }) => {
      const promises = [];
      for (let i = 0; i < quantity; i++) {
        const query = prisma.signature.create({
          data: {
            documentId: document.id,
            signeeId: id
          }
        });
        promises.push(query);
      };

      return promises;
    })
  );

  return res
    .status(201)
    .json({ message: 'Documento criado com sucesso', documentId: document.id });
};