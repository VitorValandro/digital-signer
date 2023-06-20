import formidable from "formidable";
import { AuthorizedRequest } from "../modules/users/users.middleware";
import { BinaryLike, createHash } from "crypto";

export const parseFormDataWithFiles = (req: AuthorizedRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      return err ? reject(err) : resolve({ fields, files });
    });
  });

export const getFileExtension = (fileName: string) => fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);

export const sha256 = (data: BinaryLike) => {
  return createHash('sha256')
    .update(data)
    .digest()
    .toString('hex');
};

export const mapValuesToPdfProportion = (positions: { x: number | null, y: number | null, width: number | null, height: number | null }) => {
  if (!positions.x || !positions.y || !positions.width || !positions.height) return;
  const PDF_HEIGHT = 841.91998;
  const PDF_WIDTH = 594.95996;
  const SCREEN_HEIGHT = 1132;
  const SCREEN_WIDTH = 800;

  return {
    x: (positions.x * PDF_WIDTH) / SCREEN_WIDTH,
    y: (positions.y * PDF_HEIGHT) / SCREEN_HEIGHT,
    width: (positions.width * PDF_WIDTH) / SCREEN_WIDTH,
    height: (positions.height * PDF_HEIGHT) / SCREEN_HEIGHT
  }
}