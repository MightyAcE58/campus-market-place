import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { IStorageProvider, StoredFile } from "./storage.interface.js";
import { env } from "../config/env.js";

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.STORAGE_UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }): Promise<StoredFile> {
    const ext = path.extname(file.originalname) || ".bin";
    const storedName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, storedName);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      path: filePath,
      url: `${env.APP_BASE_URL}/uploads/${storedName}`,
      provider: "LOCAL",
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(storedName: string): string {
    return `${env.APP_BASE_URL}/uploads/${path.basename(storedName)}`;
  }
}
