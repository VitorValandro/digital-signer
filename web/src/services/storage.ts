import { File } from 'megajs';

interface StorageProvider {
  download: (fileUrl: string) => Promise<{ fileName: string, file: Buffer }>;
}

class CloudStorageProvider implements StorageProvider {
  async download(fileUrl: string) {
    const file = File.fromURL(fileUrl);
    const fileName = (await file.loadAttributes()).name || 'error_retrieving_name.pdf';
    const buffer = await file.downloadBuffer({});
    return { fileName, file: buffer };
  };
}

export const storageProvider: StorageProvider = new CloudStorageProvider();
