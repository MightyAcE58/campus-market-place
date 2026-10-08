import crypto from "crypto";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { normalizePhone } from "../utils/phone.js";

export function hashOtp(phone: string, otp: string): string {
  return crypto
    .createHmac("sha256", env.OTP_SECRET)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

export interface OtpRequestResult {
  phone: string;
  cooldownSeconds: number;
  expiresInSeconds: number;
  devOtp?: string; // Included only in development for convenience
}

export class OtpService {
  async requestOtp(rawPhone: string, ipAddress?: string): Promise<OtpRequestResult> {
    const phone = normalizePhone(rawPhone);
    const now = new Date();

    // Check existing OTP request record for this phone
    const existing = await prisma.otpRequest.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    let requestCount = 1;
    let cooldownSeconds = 30;

    if (existing) {
      // Check if under an active 5-minute cooldown
      if (existing.cooldownUntil && existing.cooldownUntil > now) {
        const remainingSeconds = Math.ceil(
          (existing.cooldownUntil.getTime() - now.getTime()) / 1000
        );
        throw new AppError(
          "OTP_RATE_LIMITED",
          `Too many OTP requests. Please wait ${remainingSeconds} seconds.`,
          429,
          { remainingSeconds }
        );
      }

      // Check minimum interval between requests
      const elapsedSeconds = Math.floor(
        (now.getTime() - existing.lastRequestedAt.getTime()) / 1000
      );

      if (existing.requestCount === 1 && elapsedSeconds < 30) {
        const wait = 30 - elapsedSeconds;
        throw new AppError(
          "OTP_RATE_LIMITED",
          `Please wait ${wait} seconds before requesting another code.`,
          429,
          { remainingSeconds: wait }
        );
      }

      if (existing.requestCount === 2 && elapsedSeconds < 60) {
        const wait = 60 - elapsedSeconds;
        throw new AppError(
          "OTP_RATE_LIMITED",
          `Please wait ${wait} seconds before requesting another code.`,
          429,
          { remainingSeconds: wait }
        );
      }

      if (existing.requestCount >= 3) {
        // Cycle resets after 5 minutes cooldown
        requestCount = 1;
        cooldownSeconds = 30;
      } else {
        requestCount = existing.requestCount + 1;
        cooldownSeconds = requestCount === 2 ? 60 : 300;
      }
    }

    // Generate 6 digit OTP (use 123456 in dev/test for seamless developer testing)
    const code =
      env.NODE_ENV === "production"
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : "123456";

    const hashedOtp = hashOtp(phone, code);
    const expiresAt = new Date(now.getTime() + env.OTP_EXPIRY_SECONDS * 1000);
    const cooldownUntil =
      requestCount === 3 ? new Date(now.getTime() + 300 * 1000) : null;

    await prisma.otpRequest.create({
      data: {
        phone,
        hashedOtp,
        attemptCount: 0,
        requestCount,
        lastRequestedAt: now,
        cooldownUntil,
        expiresAt,
      },
    });

    return {
      phone,
      cooldownSeconds: requestCount === 1 ? 30 : requestCount === 2 ? 60 : 300,
      expiresInSeconds: env.OTP_EXPIRY_SECONDS,
      devOtp: env.NODE_ENV !== "production" ? code : undefined,
    };
  }

  async verifyOtp(rawPhone: string, code: string): Promise<boolean> {
    const phone = normalizePhone(rawPhone);
    const now = new Date();

    const otpRecord = await prisma.otpRequest.findFirst({
      where: {
        phone,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new AppError("INVALID_OTP", "Invalid or expired OTP code.", 400);
    }

    if (otpRecord.expiresAt < now) {
      throw new AppError("OTP_EXPIRED", "The verification code has expired.", 400);
    }

    if (otpRecord.attemptCount >= 5) {
      throw new AppError(
        "OTP_RATE_LIMITED",
        "Too many failed verification attempts. Please request a new OTP.",
        429
      );
    }

    const hashedInput = hashOtp(phone, code);
    if (hashedInput !== otpRecord.hashedOtp) {
      await prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { attemptCount: { increment: 1 } },
      });
      throw new AppError("INVALID_OTP", "Invalid verification code.", 400);
    }

    // Invalidate OTP on successful verification
    await prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: now },
    });

    return true;
  }
}

export const otpService = new OtpService();
