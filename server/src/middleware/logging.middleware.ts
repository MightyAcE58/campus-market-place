import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${durationMs}ms)`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.userId,
    });
  });

  next();
}
