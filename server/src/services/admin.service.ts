import crypto from "crypto";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/errors.js";
import { AccessStatus, Role, VendorType, AccessPlan } from "@prisma/client";
import { normalizePhone } from "../utils/phone.js";
import { logAudit } from "../utils/audit.js";
import { logger } from "../utils/logger.js";

export class AdminService {
  async onboardVendor(
    adminUserId: string,
    data: {
      businessName: string;
      ownerName: string;
      email: string;
      phone: string;
      whatsappNumber: string;
      vendorType: VendorType;
      accessPlan?: AccessPlan;
      accessStartDate: string;
      accessEndDate: string;
      monthlyPrice?: number;
      serviceArea?: string;
      description?: string;
    }
  ) {
    const normalizedPhone = normalizePhone(data.phone);
    const normalizedWa = normalizePhone(data.whatsappNumber);

    // Generate secure expiring activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h validity

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or link user as VENDOR_OWNER
      let user = await tx.user.findUnique({
        where: { phone: normalizedPhone },
      });

      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: Role.VENDOR_OWNER,
            activationToken,
            activationTokenExpiresAt,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            name: data.ownerName,
            phone: normalizedPhone,
            role: Role.VENDOR_OWNER,
            activationToken,
            activationTokenExpiresAt,
          },
        });
      }

      // 2. Create Vendor entity
      const vendor = await tx.vendor.create({
        data: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          email: data.email.toLowerCase(),
          phone: normalizedPhone,
          whatsappNumber: normalizedWa,
          vendorType: data.vendorType,
          accessStatus: AccessStatus.ACTIVE,
          accessStart: new Date(data.accessStartDate),
          accessEnd: new Date(data.accessEndDate),
          plan: data.accessPlan || AccessPlan.PAID,
          monthlyPrice: data.monthlyPrice || 0,
          serviceArea: data.serviceArea || "All campus hostels",
          description: data.description || "Trusted campus vendor",
          ownerId: user.id,
          mark: data.businessName.substring(0, 2).toUpperCase(),
          color:
            data.vendorType === VendorType.FOOD
              ? "sage"
              : data.vendorType === VendorType.LAUNDRY
              ? "lilac"
              : "sky",
        },
      });

      // 3. Create default primary service for this vendor
      const serviceName =
        data.vendorType === VendorType.BIKE_RIDE
          ? "Bike Ride"
          : data.vendorType === VendorType.LAUNDRY
          ? "Wash + Iron"
          : "Browse Menu";

      await tx.vendorService.create({
        data: {
          vendorId: vendor.id,
          serviceType: data.vendorType,
          name: serviceName,
          description: `${serviceName} provided by ${vendor.businessName}`,
        },
      });

      return { user, vendor, activationToken };
    });

    // Mock Email Invitation Dispatch
    logger.info(
      `[Email Service] Sent activation link to ${data.email}: ${process.env.APP_BASE_URL || "http://localhost:5173"}/activate?token=${activationToken}`
    );

    await logAudit({
      userId: adminUserId,
      action: "VENDOR_ONBOARDED",
      entityType: "Vendor",
      entityId: result.vendor.id,
      metadata: {
        businessName: data.businessName,
        vendorType: data.vendorType,
      },
    });

    return {
      vendor: result.vendor,
      activationToken: result.activationToken,
      activationUrl: `/activate?token=${result.activationToken}`,
    };
  }

  async getVendors(search?: string) {
    const vendors = await prisma.vendor.findMany({
      include: {
        services: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!search) return vendors;
    const q = search.toLowerCase();
    return vendors.filter(
      (v) =>
        v.businessName.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.phone.includes(q)
    );
  }

  async getVendorById(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        services: true,
        riders: true,
        offers: true,
        owner: true,
      },
    });

    if (!vendor) throw new AppError("NOT_FOUND", "Vendor not found.", 404);
    return vendor;
  }

  async updateVendorStatus(
    vendorId: string,
    status: AccessStatus,
    adminUserId: string
  ) {
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { accessStatus: status },
    });

    await logAudit({
      userId: adminUserId,
      action: `VENDOR_STATUS_CHANGED_${status}`,
      entityType: "Vendor",
      entityId: vendorId,
    });

    return vendor;
  }

  async getUsers(search?: string) {
    const users = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.hostel && u.hostel.toLowerCase().includes(q))
    );
  }

  async getPlatformStats() {
    const [
      activeVendors,
      totalStudents,
      activeServices,
      pendingRequests,
      completedToday,
    ] = await Promise.all([
      prisma.vendor.count({ where: { accessStatus: AccessStatus.ACTIVE } }),
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.vendorService.count({ where: { active: true } }),
      prisma.booking.count({
        where: {
          status: { in: ["REQUESTED", "RECEIVED", "ACCEPTED", "PROCESSING", "PREPARING"] },
        },
      }),
      prisma.booking.count({
        where: {
          status: "COMPLETED",
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return {
      activeVendors,
      totalStudents,
      activeServices,
      pendingRequests,
      completedToday,
    };
  }

  async getActivityLogs(limit = 20) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });
  }
}

export const adminService = new AdminService();
