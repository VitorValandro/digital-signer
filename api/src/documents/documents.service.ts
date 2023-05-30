import { z } from 'zod';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs';

import { AuthorizedRequest } from '../users/users.middleware';
import { prisma } from '../../prisma-client';
import { storageProvider } from '../providers/storage.provider';
import { parseFormDataWithFiles } from '../helpers/utils';

export const createDocument = async (req: AuthorizedRequest, res: Response) => {
  const DocumentDto = z.object({
    documentUrl: z.string().url(),
    signatures: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          pageIndex: z.number(),
          signeeId: z.string().uuid()
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
    console.error(err);
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

  await Promise.all(documentData.signatures.map((signature) => {
    return prisma.signature.create({
      data: {
        documentId: document.id,
        ...signature
      }
    });
  }));

  return res
    .status(201)
    .json({ message: 'Documento criado com sucesso', documentId: document.id });
};

export const uploadDocument = async (req: AuthorizedRequest, res: Response) => {
  const body = await parseFormDataWithFiles(req);

  const documentFile = Array.isArray(body.files.document)
    ? body.files.document[0]
    : body.files.document;

  if (!documentFile) return res.status(400).json({ message: 'Nenhum arquivo fornecido' });

  const documentId = uuid();
  const fileName = `${documentId}_${documentFile.originalFilename}`;

  const storageUrl = await storageProvider.save(
    fileName,
    fs.readFileSync(documentFile.filepath),
    'signed-documents'
  );

  return res.status(201).json({ fileName, storageUrl });
};

export const listDocumentsByUser = async (req: AuthorizedRequest, res: Response) => {
  const { userId } = req;

  try {
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          {
            ownerId: userId
          },
          {
            signatures: {
              some: {
                signeeId: userId
              }
            }
          }]
      },
      select: {
        createdAt: true,
        signatures: {
          select: {
            isSigned: true,
            signedAt: true,
            signee: {
              select: {
                name: true
              }
            }
          },
        },
        owner: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(200).json(documents)
  } catch (err) {
    console.error(err);
    return res.json(500).json({ message: "Ocorreu um problema ao listar os documentos" });
  }
}