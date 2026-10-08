import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { storageProvider } from "../storage/index.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";

const uploadMiddleware = multer({
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("INVALID_FILE_TYPE", "Only images and PDF files are allowed.", 400));
    }
  },
});

export const uploadSingle = uploadMiddleware.single("file");

export async function handleFileUpload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError("VALIDATION_ERROR", "No file uploaded.", 400);
    }

    const stored = await storageProvider.uploadFile({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      buffer: req.file.buffer,
      size: req.file.size,
    });

    const asset = await prisma.fileAsset.create({
      data: {
        originalName: stored.originalName,
        storedName: stored.storedName,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        path: stored.path,
        url: stored.url,
        provider: stored.provider,
        uploadedBy: req.user?.userId,
      },
    });

    sendSuccess(res, {
      id: asset.id,
      url: asset.url,
      originalName: asset.originalName,
    }, 201);
  } catch (err) {
    next(err);
  }
}
