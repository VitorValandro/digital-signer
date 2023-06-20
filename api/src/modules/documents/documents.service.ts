import { z } from 'zod';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs';

import { AuthorizedRequest } from '../users/users.middleware';
import { prisma } from '../../../prisma-client';
import { storageProvider } from '../../providers/storage.provider';
import { parseFormDataWithFiles, sha256 } from '../../helpers/utils';
import { VerifyPDF } from '../../helpers/VerifyPdf';
import { verifyDocumentOnBlockchain } from '../../blockchain/api';

export const createDocument = async (req: AuthorizedRequest, res: Response) => {
  const DocumentDto = z.object({
    title: z.string(),
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
      title: documentData.title,
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

export const verifyDocument = async (req: AuthorizedRequest, res: Response) => {
  const body = await parseFormDataWithFiles(req);

  const documentFile = Array.isArray(body.files.document)
    ? body.files.document[0]
    : body.files.document;

  if (!documentFile) return res.status(400).json({ message: 'Nenhum arquivo fornecido' });

  const buffer = fs.readFileSync(documentFile.filepath)
  const fileHash = sha256(buffer);

  try {
    const foundDocument = await prisma.document.findFirst({
      where: { signedFileHash: fileHash },
      select: {
        title: true,
        createdAt: true,
        block: true,
        blankDocumentUrl: true,
        signedDocumentUrl: true,
        signatures: {
          select: {
            isSigned: true,
            signedAt: true,
            signee: {
              select: {
                name: true,
                email: true
              }
            }
          },
        },
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    if (!foundDocument?.block) throw { message: "Documento não encontrado nos registros" }

    const validDocumentAuthentication = VerifyPDF.verify(buffer);
    try {
      const validOnBlockchain = validDocumentAuthentication && await verifyDocumentOnBlockchain(fileHash, foundDocument.block)
    } catch (err: any) {
      return res.status(200).json({ valid: validDocumentAuthentication, document: foundDocument, message: err.error })
    }

    return res.status(200).json({ valid: validDocumentAuthentication, document: foundDocument });
  } catch (error: any) {
    console.error(error);
    if (error.message) return res.status(200).json({ valid: false, message: error.message });
    if (error.error) return res.status(400).json({ valid: false, message: error.error })
    return res.status(500).json({ message: "Ocorreu um erro ao tentar validar a autenticidade do documento" })
  }
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
        id: true,
        title: true,
        createdAt: true,
        signatures: {
          select: {
            isSigned: true,
            signedAt: true,
            signee: {
              select: {
                id: true,
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

export const getDocumentToSignById = async (req: AuthorizedRequest, res: Response) => {
  const { userId } = req;
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "O identificador do documento não foi especificado" });

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: id
      },
      include: {
        signatures: {
          where: {
            isSigned: true
          },
          include: {
            signee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            signatureAsset: {
              select: {
                id: true,
                signatureUrl: true
              }
            }
          },
        },
        owner: true
      }
    });

    const pendingSignatures = await prisma.signature.findMany({
      where: {
        documentId: id,
        signeeId: userId,
        isSigned: false
      },
      include: {
        signee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const response = {
      ...document, pendingSignatures
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.json(500).json({ message: "Ocorreu um problema ao buscar os detalhes para assinatura do documento" });
  }
}

export const getDocumentToViewById = async (req: AuthorizedRequest, res: Response) => {
  const { userId } = req;
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "O identificador do documento não foi especificado" });

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: id
      },
      include: {
        signatures: {
          include: {
            signee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            signatureAsset: {
              select: {
                id: true,
                signatureUrl: true
              }
            }
          },
        },
        owner: true
      }
    });

    return res.status(200).json(document);
  } catch (err) {
    console.error(err);
    return res.json(500).json({ message: "Ocorreu um problema ao buscar os detalhes do documento para visualização" });
  }
}