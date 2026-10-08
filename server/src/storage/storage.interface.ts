export interface StoredFile {
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  url: string;
  provider: string;
}

export interface IStorageProvider {
  uploadFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }): Promise<StoredFile>;
  deleteFile(path: string): Promise<void>;
  getUrl(path: string): string;
}
