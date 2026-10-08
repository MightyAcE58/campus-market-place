import { Response } from "express";
import { ErrorCode } from "./errors.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): void {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode = 400,
  details?: unknown
): void {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  res.status(statusCode).json(payload);
}
