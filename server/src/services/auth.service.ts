import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role, AccessStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { otpService } from "../auth/otp.js";
import { generateAccessToken, generateRefreshToken } from "../auth/jwt.js";
import { AppError } from "../utils/errors.js";
import { normalizePhone } from "../utils/phone.js";
import { logAudit } from "../utils/audit.js";

export class AuthService {
  async requestCustomerOtp(phone: string, ipAddress?: string) {
    const result = await otpService.requestOtp(phone, ipAddress);
    await logAudit({
      action: "CUSTOMER_OTP_REQUESTED",
      entityType: "User",
      ipAddress,
      metadata: { phone: result.phone },
    });
    return result;
  }

  async verifyCustomerOtp(params: {
    phone: string;
    code: string;
    name?: string;
    hostel?: string;
    roomNumber?: string;
    ipAddress?: string;
  }) {
    const { phone: rawPhone, code, name, hostel, roomNumber, ipAddress } = params;
    const phone = normalizePhone(rawPhone);

    await otpService.verifyOtp(phone, code);

    // Find or create customer
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || "Student User",
          hostel: hostel || "Maple Hostel",
          roomNumber: roomNumber || "B-204",
          role: Role.CUSTOMER,
        },
      });

      await logAudit({
        userId: user.id,
        action: "CUSTOMER_REGISTERED",
        entityType: "User",
        entityId: user.id,
        ipAddress,
      });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    await logAudit({
      userId: user.id,
      action: "CUSTOMER_LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
      ipAddress,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        hostel: user.hostel,
        roomNumber: user.roomNumber,
        role: user.role,
        notificationPreferences: user.notificationPreferences,
      },
      accessToken,
      refreshToken,
    };
  }

  async adminLogin(phone: string, rawPass: string, ipAddress?: string) {
    const normalized = normalizePhone(phone);
    const user = await prisma.user.findFirst({
      where: {
        phone: normalized,
        role: Role.ADMIN,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("UNAUTHORIZED", "Invalid admin credentials.", 401);
    }

    const matches = await bcrypt.compare(rawPass, user.passwordHash);
    if (!matches) {
      throw new AppError("UNAUTHORIZED", "Invalid admin credentials.", 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: Role.ADMIN,
    });
    const refreshToken = await generateRefreshToken(user.id);

    await logAudit({
      userId: user.id,
      action: "ADMIN_LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
      ipAddress,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async vendorLogin(emailOrPhone: string, rawPass: string, ipAddress?: string) {
    const isEmail = emailOrPhone.includes("@");
    let vendor;

    if (isEmail) {
      vendor = await prisma.vendor.findFirst({
        where: { email: emailOrPhone.toLowerCase() },
        include: { owner: true },
      });
    } else {
      const normalized = normalizePhone(emailOrPhone);
      vendor = await prisma.vendor.findFirst({
        where: { phone: normalized },
        include: { owner: true },
      });
    }

    if (!vendor || !vendor.owner || !vendor.owner.passwordHash) {
      throw new AppError("UNAUTHORIZED", "Invalid vendor credentials.", 401);
    }

    if (vendor.accessStatus === AccessStatus.REMOVED) {
      throw new AppError("FORBIDDEN", "Vendor account has been removed.", 403);
    }

    const matches = await bcrypt.compare(rawPass, vendor.owner.passwordHash);
    if (!matches) {
      throw new AppError("UNAUTHORIZED", "Invalid vendor credentials.", 401);
    }

    const accessToken = generateAccessToken({
      userId: vendor.owner.id,
      role: Role.VENDOR_OWNER,
      vendorId: vendor.id,
    });
    const refreshToken = await generateRefreshToken(vendor.owner.id);

    await logAudit({
      userId: vendor.owner.id,
      action: "VENDOR_LOGIN_SUCCESS",
      entityType: "Vendor",
      entityId: vendor.id,
      ipAddress,
    });

    return {
      user: {
        id: vendor.owner.id,
        name: vendor.owner.name,
        role: vendor.owner.role,
        vendorId: vendor.id,
        businessName: vendor.businessName,
      },
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        accessStatus: vendor.accessStatus,
        vendorType: vendor.vendorType,
      },
      accessToken,
      refreshToken,
    };
  }

  async activateVendor(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        activationToken: token,
        activationTokenExpiresAt: { gt: new Date() },
      },
      include: { ownedVendors: true },
    });

    if (!user) {
      throw new AppError("UNAUTHORIZED", "Invalid or expired activation invitation.", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        activationToken: null,
        activationTokenExpiresAt: null,
      },
    });

    // Update vendor status to ACTIVE if it was INVITED
    const vendor = user.ownedVendors[0];
    if (vendor && vendor.accessStatus === AccessStatus.INVITED) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { accessStatus: AccessStatus.ACTIVE },
      });
    }

    const accessToken = generateAccessToken({
      userId: updatedUser.id,
      role: Role.VENDOR_OWNER,
      vendorId: vendor?.id,
    });
    const refreshToken = await generateRefreshToken(updatedUser.id);

    await logAudit({
      userId: user.id,
      action: "VENDOR_ACCOUNT_ACTIVATED",
      entityType: "Vendor",
      entityId: vendor?.id,
    });

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        vendorId: vendor?.id,
      },
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedVendors: {
          select: {
            id: true,
            businessName: true,
            accessStatus: true,
            vendorType: true,
            plan: true,
            accessEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("NOT_FOUND", "User not found.", 404);
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      hostel: user.hostel,
      roomNumber: user.roomNumber,
      profilePhoto: user.profilePhoto,
      role: user.role,
      notificationPreferences: user.notificationPreferences,
      vendor: user.ownedVendors[0] || null,
    };
  }

  async updateProfile(userId: string, data: {
    name?: string;
    hostel?: string;
    roomNumber?: string;
    notificationPreferences?: Record<string, unknown>;
  }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.hostel ? { hostel: data.hostel } : {}),
        ...(data.roomNumber ? { roomNumber: data.roomNumber } : {}),
        ...(data.notificationPreferences ? { notificationPreferences: data.notificationPreferences as any } : {}),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      hostel: updated.hostel,
      roomNumber: updated.roomNumber,
      notificationPreferences: updated.notificationPreferences,
    };
  }
}

export const authService = new AuthService();
