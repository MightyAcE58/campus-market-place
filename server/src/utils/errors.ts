export type ErrorCode =
  | "INVALID_OTP"
  | "OTP_EXPIRED"
  | "OTP_RATE_LIMITED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VENDOR_SUSPENDED"
  | "VENDOR_EXPIRED"
  | "SERVICE_NOT_AVAILABLE"
  | "INVALID_STATUS_TRANSITION"
  | "INVALID_LOCATION"
  | "INVALID_PASSENGER_COUNT"
  | "RESTRICTED_CLOTHING"
  | "INVALID_SERVICE_CONFIGURATION"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_ALREADY_CANCELLED"
  | "DUPLICATE_REQUEST"
  | "PRICE_CHANGED"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
