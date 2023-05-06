import { Signature } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

import { storageProvider } from "../providers/storage.provider";

export const drawSignatureOnFile = async (documentFile: Buffer, signatures: Array<Signature & { signatureAsset: { signatureUrl: string | null } | null }>) => {
  const document = await PDFDocument.load(documentFile);

  await Promise.all(signatures.map(async signature => {
    if (
      !signature.x
      || !signature.y
      || !signature.width
      || !signature.height
      || signature.pageIndex === null
      || !signature.signatureAsset
      || !signature.signatureAsset.signatureUrl
    )
      throw 'Informações insuficientes para assinar o documento';

    const { fileName, file } = await storageProvider.download(signature.signatureAsset.signatureUrl);
    const assetImage = await document.embedPng(file);

    const pages = document.getPages()
    const signaturePage = pages[signature.pageIndex];

    signaturePage?.drawImage(assetImage, {
      x: signature.x,
      y: signaturePage.getHeight() - signature.y - signature.height,
      width: signature.width,
      height: signature.height
    })
  }))

  return await document.save() as Buffer;
}