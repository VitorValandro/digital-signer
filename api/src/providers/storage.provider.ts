import * as fs from 'node:fs';
import { Storage } from 'megajs';

interface StorageProvider {
  save: (fileName: string, file: Buffer, folderName: string | null,) => Promise<string>;
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
    const file = await this.storage.upload(`blank_${fileName}`, fileContent).complete;
    return await file.link(false);
  }
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
}

export const storageProvider: StorageProvider =
  process.env.NODE_ENV === 'production' ? new CloudStorageProvider() : new LocalStorageProvider();
