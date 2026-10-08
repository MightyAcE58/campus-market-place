import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.code}]: ${err.message}`, {
      requestId,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    const passengerErr = err.errors.find((e) => e.path.includes("passengers"));
    if (passengerErr) {
      return sendError(res, "INVALID_PASSENGER_COUNT", passengerErr.message, 400);
    }

    const formatted = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    logger.warn("Validation error", { requestId, details: formatted });
    return sendError(res, "VALIDATION_ERROR", "Validation failed", 400, formatted);
  }

  // Unexpected internal errors: log complete stack trace internally, do not leak to client
  logger.error("Unhandled internal server error", {
    requestId,
    error: err.message,
    stack: err.stack,
  });

  return sendError(
    res,
    "INTERNAL_ERROR",
    "An unexpected internal error occurred. Please try again later.",
    500
  );
}
