import { z } from 'zod';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs';

import { AuthorizedRequest } from '../users/users.middleware';
import { prisma } from '../../prisma-client';
import SignPDF from '../sign/signPdf';
import { storageProvider } from '../providers/storage.provider';
import { getFileExtension, parseFormDataWithFiles } from '../helpers/utils';
import { drawSignatureOnFile } from '../sign/drawSignatureOnFile';
import { createTransactionOnBlockchain } from '../sign/createTransactionOnBlockchain';

export const listUserAssets = async (req: AuthorizedRequest, res: Response) => {
  if (!req.userId) return res.status(400).json({ message: "Identificação do usuário não encontrada." })
  const assets = await prisma.signatureAsset.findMany({
    where: {
      signeeId: req.userId
    }
  });

  return res.status(200).json(assets);
}

export const signDocument = async (req: AuthorizedRequest, res: Response) => {
  const newSignSchema = z.array(
    z.object({
      id: z.string().uuid(),
      width: z.number().positive(),
      height: z.number().positive(),
      isSigned: z.boolean(),
      x: z.number().positive(),
      y: z.number().positive(),
      pageIndex: z.number(),
      signatureAssetId: z.string().uuid()
    }
    )).min(1);

  type SignDocumentDto = z.infer<typeof newSignSchema>;

  const sign = req.body as SignDocumentDto;

  try {
    newSignSchema.parse(req.body);
  }
  catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Formulário inválido' })
    return res.status(500).json({ error: err })
  }

  try {
    const result = await Promise.all(
      sign.map(async (signBody) => {
        const { signatureAssetId, ...body } = signBody;

        return await prisma.signature.update({
          where: {
            id: signBody.id
          },
          data: {
            ...body,
            signatureAsset: {
              connect: {
                id: signatureAssetId
              }
            }
          }
        })
      })
    )

    if (!result?.length) return res
      .status(204)
      .json({ message: 'Nenhuma assinatura fornecida' });

    await saveSignedDocument(result[0]?.documentId);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error })
  }

  return res
    .status(201)
    .json({ message: 'Documento assinado com sucesso' });
};

const saveSignedDocument = async (documentId: string | undefined) => {
  if (!documentId) return;

  const document = await prisma.document.findUniqueOrThrow({
    where: {
      id: documentId
    },
    include: {
      signatures: {
        include: {
          signatureAsset: {
            select: {
              signatureUrl: true
            }
          }
        }
      }
    }
  }).catch(err => {
    let message = "Ocorreu um problema ao buscar o documento."
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025')
        message = "Documento não encontrado";
    }
    throw message;
  });

  if (document.signatures.some(signature => !signature.isSigned)) return;

  const { fileName, file } = await storageProvider.download(document.blankDocumentUrl);
  const documentWithSignatureAssets = await drawSignatureOnFile(file, document.signatures);

  const pdfMetadata = new SignPDF(documentWithSignatureAssets, './assets/test-certificate.p12', 0);

  const pdfBuffer = await pdfMetadata.signPDF();
  const signedFileName = `signed_${fileName}`;
  const signedDocumentUrl = await storageProvider.save(signedFileName, pdfBuffer, 'signed-documents');

  const { fileName: _, file: signedFile } = await storageProvider.download(signedDocumentUrl);

  await createTransactionOnBlockchain(signedFile);

  await prisma.document.update({
    where: {
      id: documentId,
    },
    data: {
      signedDocumentUrl: signedDocumentUrl
    }
  })
}

export const uploadSignatureAsset = async (req: AuthorizedRequest, res: Response) => {
  const body = await parseFormDataWithFiles(req);

  const signatureFile = Array.isArray(body.files.signature)
    ? body.files.signature[0]
    : body.files.signature;

  if (!signatureFile?.originalFilename) return res.status(400).json({ message: 'Nenhum arquivo para assinatura foi fornecido' });

  if (!body.fields.userId || typeof body.fields.userId !== 'string')
    return res.status(400).json({ message: 'Formulário inválido. Sem identificação para o usuário' });

  const user = await prisma.user.findUnique({
    where: { id: body.fields.userId },
    select: { id: true },
  });

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  const signatureId = uuid();
  const fileExtension = getFileExtension(signatureFile.originalFilename);
  const fileName = `signature_${signatureId}.${fileExtension}`;

  const storageUrl = await storageProvider.save(fileName, fs.readFileSync(signatureFile.filepath), 'signatures');

  const signatureAsset = await prisma.signatureAsset.create({
    data: {
      id: signatureId,
      signeeId: body.fields.userId,
      signatureUrl: storageUrl,
    },
  });

  return res.status(201).json({ signatureAsset });
}