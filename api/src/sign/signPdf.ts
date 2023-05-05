import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFHexString,
  PDFString,
} from "pdf-lib";
import signer from "node-signpdf";
import fs from "node:fs";

import PDFArrayCustom from "../helpers/PDFArray.custom";

export default class SignPDF {
  pdfDoc: Buffer;
  certificate: Buffer;
  page: number;

  constructor(pdfFile: string, certFile: string, page: number) {
    this.pdfDoc = fs.readFileSync(pdfFile);
    this.certificate = fs.readFileSync(certFile);
    this.page = page;
  }

  async signPDF() {
    let newPDF = await this._addPlaceholder();
    newPDF = signer.sign(newPDF, this.certificate);

    return newPDF;
  }

  /**
   * @see https://github.com/Hopding/pdf-lib/issues/112#issuecomment-569085380
   * @see Table 252 of PDF specification
   */
  async _addPlaceholder() {
    const loadedPdf = await PDFDocument.load(this.pdfDoc);
    const ByteRange = PDFArrayCustom.withContext(loadedPdf.context);
    const DEFAULT_BYTE_RANGE_PLACEHOLDER = "**********";
    const SIGNATURE_LENGTH = 3322;
    const pages = loadedPdf.getPages();

    ByteRange.push(PDFNumber.of(0));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));

    const signatureDict = loadedPdf.context.obj({
      Type: "Sig",
      Filter: "Adobe.PPKLite",
      SubFilter: "adbe.pkcs7.detached",
      ByteRange,
      Contents: PDFHexString.of("A".repeat(SIGNATURE_LENGTH)),
      M: PDFString.fromDate(new Date()),
    });

    const signatureDictRef = loadedPdf.context.register(signatureDict);

    const widgetDict = loadedPdf.context.obj({
      Type: "Annot",
      Subtype: "Widget",
      FT: "Sig",
      Rect: [0, 0, 0, 0], // Signature rect size
      V: signatureDictRef,
      T: PDFString.of("test signature"),
      F: 4,
      P: pages[this.page].ref,
    });

    const widgetDictRef = loadedPdf.context.register(widgetDict);

    pages[this.page].node.set(
      PDFName.of("Annots"),
      loadedPdf.context.obj([widgetDictRef])
    );

    loadedPdf.catalog.set(
      PDFName.of("AcroForm"),
      loadedPdf.context.obj({
        SigFlags: 3,
        Fields: [widgetDictRef],
      })
    );

    const pdfBytes = await loadedPdf.save({ useObjectStreams: false });

    return SignPDF.uint8ToBuffer(pdfBytes);
  }

  static uint8ToBuffer(uint8: Uint8Array) {
    let buf = Buffer.alloc(uint8.byteLength);
    const view = new Uint8Array(uint8);

    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }
}
