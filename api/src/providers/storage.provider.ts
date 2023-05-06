import * as fs from 'node:fs';
import { Storage, File } from 'megajs';

interface StorageProvider {
  save: (fileName: string, file: Buffer, folderName: string | null,) => Promise<string>;
  download: (fileUrl: string) => Promise<{ fileName: string, file: Buffer }>;
}

class CloudStorageProvider implements StorageProvider {
  private storage: Storage;

  constructor() {
    this.storage = new Storage({
      email: process.env.STORAGE_EMAIL as string,
      password: process.env.STORAGE_PASSWORD as string,
      userAgent: 'signer'
    });

    this.storage.on('ready', () => console.log('Storage ready'));
  }

  async save(fileName: string, fileContent: Buffer, folderName: string | null): Promise<string> {
    const file = await this.storage.upload(fileName, fileContent).complete;
    return await file.link(false);
  }

  async download(fileUrl: string) {
    const file = File.fromURL(fileUrl);
    const fileName = (await file.loadAttributes()).name || 'error_retrieving_name.pdf';
    const buffer = await file.downloadBuffer({});
    return { fileName, file: buffer };
  };
}

class LocalStorageProvider implements StorageProvider {
  async save(fileName: string, fileContent: Buffer, folderName: string | null): Promise<string> {
    const baseFilePath = folderName ? `./uploads/${folderName}` : `./uploads/`;

    if (!fs.existsSync(baseFilePath)) {
      fs.mkdirSync(baseFilePath);
    }

    const filePath = `${baseFilePath}/${fileName}`;

    fs.writeFileSync(filePath, fileContent);
    return filePath;
  }

  async download(fileUrl: string) {
    const fileName = fileUrl.split('/').pop() || 'error_retrieving_name.pdf';
    const buffer = await fs.readFileSync(fileUrl);
    return { fileName, file: buffer };
  };
}

export const storageProvider: StorageProvider =
  process.env.NODE_ENV === 'production' ? new CloudStorageProvider() : new LocalStorageProvider();
