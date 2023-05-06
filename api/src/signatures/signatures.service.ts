import { z } from 'zod';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

import { AuthorizedRequest } from '../users/users.middleware';
import { prisma } from '../../prisma-client';
import SignPDF from '../sign/signPdf';
import { storageProvider } from '../providers/storage.provider';

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
      signatureAssetId: z.string().uuid().optional()
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
            // signatureAsset: {
            //   connect: {
            //     id: signatureAssetId
            //   }
            // }
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
  const pdfMetadata = new SignPDF(file, './assets/test-certificate.p12', 0);

  const pdfBuffer = await pdfMetadata.signPDF();
  const signedFileName = `signed_${fileName}`;
  const signedDocumentUrl = await storageProvider.save(signedFileName, pdfBuffer, 'signed-documents');

  await prisma.document.update({
    where: {
      id: documentId,
    },
    data: {
      signedDocumentUrl: signedDocumentUrl
    }
  })
}