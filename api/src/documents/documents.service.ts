import { z } from 'zod';
import { Response } from 'express';
import formidable from 'formidable';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs';

import { AuthorizedRequest } from '../users/users.middleware';
import { prisma } from '../../prisma-client';
import { storageProvider } from '../providers/storage.provider';

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

  documentData.signees.map(async ({ id, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      await prisma.signature.create({
        data: {
          documentId: document.id,
          signeeId: id
        }
      });
    };
  });

  return res
    .status(201)
    .json({ message: 'Documento criado com sucesso', documentId: document.id });
};

const parseForm = (req: AuthorizedRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      return err ? reject(err) : resolve({ fields, files });
    });
  });

export const uploadDocument = async (req: AuthorizedRequest, res: Response) => {
  const body = await parseForm(req);

  const documentFile = Array.isArray(body.files.document)
    ? body.files.document[0]
    : body.files.document;

  if (!documentFile) return res.status(400).json({ message: 'No document file provided' });

  const documentId = uuid();
  const fileName = `${documentId}_${documentFile.originalFilename}`;

  const storageUrl = await storageProvider.save(
    fileName,
    fs.readFileSync(documentFile.filepath),
    'blank-documents'
  );

  return res.status(201).json({ fileName, storageUrl });
};