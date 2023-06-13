import formidable from "formidable";
import { AuthorizedRequest } from "../users/users.middleware";
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