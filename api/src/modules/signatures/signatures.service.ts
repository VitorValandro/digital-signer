import { z } from 'zod';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs';

import { AuthorizedRequest } from '../users/users.middleware';
import { prisma } from '../../../prisma-client';
import SignPDF from '../../helpers/SignPdf';
import { storageProvider } from '../../providers/storage.provider';
import { getFileExtension, parseFormDataWithFiles } from '../../helpers/utils';
import { drawSignatureOnFile } from '../../helpers/drawSignatureOnFile';
import { createTransactionOnBlockchain } from '../../blockchain/api';

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
      signatureAssetId: z.string().uuid(),
      signeeId: z.string().uuid()
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
        const { signatureAssetId, signeeId, ...body } = signBody;

        if (signeeId !== req.userId) throw { message: "Usuário sem permissão para submeter esta assinatura", status: 401 }

        return await prisma.signature.update({
          where: {
            id: signBody.id
          },
          data: {
            ...body,
            signedAt: new Date(),
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
  } catch (error: any) {
    console.error(error);
    if (error.status === 401) return res.status(401).json({ message: error.message });
    if (error.message) return res.status(500).json({ message: error.message });
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
    throw { message };
  });

  if (document.signatures.some(signature => !signature.isSigned)) return;

  const { fileName, file } = await storageProvider.download(document.blankDocumentUrl);
  const documentWithSignatureAssets = await drawSignatureOnFile(file, document.signatures);

  const pdfMetadata = new SignPDF(documentWithSignatureAssets, './assets/insignia-certificate.p12', 0);

  const pdfBuffer = await pdfMetadata.signPDF();
  const signedFileName = `signed_${fileName}`;
  const signedDocumentUrl = await storageProvider.save(signedFileName, pdfBuffer, 'signed-documents');

  const { fileName: _, file: signedFile } = await storageProvider.download(signedDocumentUrl);

  const { fileHash, block } = await createTransactionOnBlockchain(signedFile).catch(async err => {
    await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        signedDocumentUrl,
      }
    })
    throw err;
  });

  await prisma.document.update({
    where: {
      id: documentId,
    },
    data: {
      signedDocumentUrl,
      block,
      signedFileHash: fileHash,
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

export const deleteSignatureAsset = async (req: AuthorizedRequest, res: Response) => {
  const signatureAssetSchema = z.object({
    id: z.string().uuid()
  });

  type signatureAsset = z.infer<typeof signatureAssetSchema>;

  req.body as signatureAsset;

  try {
    signatureAssetSchema.parse(req.body);
  }
  catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: 'Não foi possível deletar a assinatura. Identificador inválido.' })
    return res.status(500).json({ error: err })
  }

  const asset = await prisma.signatureAsset.findUnique({
    where: { id: req.body.id },
    select: { id: true, signatureUrl: true, signatures: true },
  });

  if (!asset) return res.status(404).json({ message: 'Não foi possível deletar a assinatura. Assinatura não encontrada.' });

  if (asset.signatures.length) return res.status(400).json({ message: `Essa assinatura foi usada ${asset.signatures.length} vez${asset.signatures.length > 1 ? 'es' : ''}. Não é possível deletar uma assinatura que já tenha sido usada em algum documento.` })

  try {
    await storageProvider.delete(asset.signatureUrl);
    await prisma.signatureAsset.delete({ where: { id: asset.id } })
  } catch (err) {
    return res.status(500).json({ error: err });
  }

  return res.status(204).send();
}