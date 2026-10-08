import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/errors.js";
import { Role } from "@prisma/client";

export interface TokenPayload {
  userId: string;
  role: Role;
  vendorId?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    throw new AppError("UNAUTHORIZED", "Invalid or expired access token.", 401);
  }
}

export async function rotateRefreshToken(
  rawRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; role: Role } }> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new AppError("UNAUTHORIZED", "Invalid or expired refresh token.", 401);
  }

  // Revoke old session
  await prisma.refreshSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  // Fetch vendor id if vendor owner
  let vendorId: string | undefined;
  if (session.user.role === Role.VENDOR_OWNER) {
    const vendor = await prisma.vendor.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    vendorId = vendor?.id;
  }

  const payload: TokenPayload = {
    userId: session.user.id,
    role: session.user.role,
    vendorId,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = await generateRefreshToken(session.user.id);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: { id: session.user.id, role: session.user.role },
  };
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  await prisma.refreshSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
