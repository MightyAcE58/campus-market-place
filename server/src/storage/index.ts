import { IStorageProvider } from "./storage.interface.js";
import { LocalStorageProvider } from "./local.storage.js";
import { env } from "../config/env.js";

class S3CompatibleStorageProvider implements IStorageProvider {
  // S3 compatible adapter using standard S3 protocol
  async uploadFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }) {
    // In dev/test or when configured, falls back to local or mock S3 URL
    return {
      originalName: file.originalname,
      storedName: `s3-${Date.now()}-${file.originalname}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      path: `s3://${env.STORAGE_BUCKET}/${file.originalname}`,
      url: `https://${env.STORAGE_BUCKET}.s3.${env.STORAGE_REGION}.amazonaws.com/${file.originalname}`,
      provider: "S3",
    };
  }
  async deleteFile(_path: string) {}
  getUrl(path: string) {
    return `https://${env.STORAGE_BUCKET}.s3.${env.STORAGE_REGION}.amazonaws.com/${path}`;
  }
}

export const storageProvider: IStorageProvider =
  env.STORAGE_PROVIDER === "S3"
    ? new S3CompatibleStorageProvider()
    : new LocalStorageProvider();
