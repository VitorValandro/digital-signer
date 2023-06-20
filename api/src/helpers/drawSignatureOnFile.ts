import { Signature } from "@prisma/client";
import { PDFDocument } from "pdf-lib";

import { storageProvider } from "../providers/storage.provider";
import { mapValuesToPdfProportion } from "./utils";

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

    const { file } = await storageProvider.download(signature.signatureAsset.signatureUrl);
    const assetImage = await document.embedPng(file);

    const pages = document.getPages()
    const signaturePage = pages[signature.pageIndex];
    const mappedValues = mapValuesToPdfProportion(signature);
    if (!mappedValues) throw "Posições inválidas para a assinatura";

    signaturePage?.drawImage(assetImage, {
      x: mappedValues.x,
      y: signaturePage.getHeight() - mappedValues.y - mappedValues.height,
      width: mappedValues.width,
      height: mappedValues.height
    })
  }))

  return await document.save() as Buffer;
}