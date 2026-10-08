import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/errors.js";
import { BookingStatus } from "@prisma/client";

export class VendorOpsService {
  async getVendorProfile(vendorId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        services: true,
        offers: true,
        riders: true,
      },
    });

    if (!vendor) {
      throw new AppError("NOT_FOUND", "Vendor not found.", 404);
    }

    return vendor;
  }

  async updateVendorProfile(vendorId: string, data: Record<string, unknown>) {
    return prisma.vendor.update({
      where: { id: vendorId },
      data: data as any,
    });
  }

  async getDashboardStats(vendorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [newRequests, inProgress, completedToday, activeOffers, vendor] = await Promise.all([
      prisma.booking.count({
        where: {
          vendorId,
          status: { in: [BookingStatus.REQUESTED, BookingStatus.RECEIVED] },
        },
      }),
      prisma.booking.count({
        where: {
          vendorId,
          status: {
            in: [
              BookingStatus.ASSIGNED,
              BookingStatus.ACCEPTED,
              BookingStatus.PREPARING,
              BookingStatus.PROCESSING,
              BookingStatus.ON_THE_WAY,
            ],
          },
        },
      }),
      prisma.booking.count({
        where: {
          vendorId,
          status: BookingStatus.COMPLETED,
          createdAt: { gte: today },
        },
      }),
      prisma.offer.count({
        where: {
          vendorId,
          published: true,
        },
      }),
      prisma.vendor.findUnique({
        where: { id: vendorId },
        select: {
          accessStatus: true,
          accessEnd: true,
          plan: true,
          monthlyPrice: true,
        },
      }),
    ]);

    return {
      newRequests,
      inProgress,
      completedToday,
      activeOffers,
      accessStatus: vendor?.accessStatus,
      accessEnd: vendor?.accessEnd,
      plan: vendor?.plan,
      monthlyPrice: vendor?.monthlyPrice,
    };
  }

  // Riders Management
  async getRiders(vendorId: string) {
    return prisma.rider.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createRider(vendorId: string, data: { name: string; phone: string; vehicleIdentifier: string }) {
    return prisma.rider.create({
      data: {
        vendorId,
        name: data.name,
        phone: data.phone,
        vehicleIdentifier: data.vehicleIdentifier,
      },
    });
  }

  async updateRider(riderId: string, vendorId: string, data: Record<string, unknown>) {
    const existing = await prisma.rider.findFirst({
      where: { id: riderId, vendorId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Rider not found.", 404);

    return prisma.rider.update({
      where: { id: riderId },
      data: data as any,
    });
  }

  async deleteRider(riderId: string, vendorId: string) {
    const existing = await prisma.rider.findFirst({
      where: { id: riderId, vendorId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Rider not found.", 404);

    return prisma.rider.delete({
      where: { id: riderId },
    });
  }

  // Menu Management
  async getMenuItems(vendorId: string) {
    const service = await prisma.vendorService.findFirst({
      where: { vendorId, serviceType: "FOOD" },
      include: { menuItems: true },
    });
    return service?.menuItems || [];
  }

  async createMenuItem(vendorId: string, data: {
    name: string;
    description?: string;
    price: number;
    category?: string;
    dietaryClassification?: "VEG" | "NON_VEG";
    color?: string;
  }) {
    let service = await prisma.vendorService.findFirst({
      where: { vendorId, serviceType: "FOOD" },
    });

    if (!service) {
      service = await prisma.vendorService.create({
        data: {
          vendorId,
          serviceType: "FOOD",
          name: "Food Service",
        },
      });
    }

    return prisma.foodMenuItem.create({
      data: {
        serviceId: service.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category || "Main",
        dietaryClassification: data.dietaryClassification || "VEG",
        color: data.color || "meal-one",
      },
    });
  }

  async updateMenuItem(itemId: string, data: Record<string, unknown>) {
    return prisma.foodMenuItem.update({
      where: { id: itemId },
      data: data as any,
    });
  }

  async deleteMenuItem(itemId: string) {
    return prisma.foodMenuItem.delete({
      where: { id: itemId },
    });
  }

  // Offers Management
  async getOffers(vendorId: string) {
    return prisma.offer.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createOffer(vendorId: string, data: {
    title: string;
    description?: string;
    applicableItem?: string;
    originalPrice?: number;
    offerPrice: number;
    startAt: string;
    endAt: string;
    eligibility?: string;
    location?: string;
  }) {
    return prisma.offer.create({
      data: {
        vendorId,
        title: data.title,
        description: data.description,
        applicableItem: data.applicableItem,
        originalPrice: data.originalPrice,
        offerPrice: data.offerPrice,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        eligibility: data.eligibility || "All students",
        location: data.location || "Campus",
        published: true,
      },
    });
  }

  async setOfferPublishStatus(offerId: string, vendorId: string, published: boolean) {
    const existing = await prisma.offer.findFirst({
      where: { id: offerId, vendorId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Offer not found.", 404);

    return prisma.offer.update({
      where: { id: offerId },
      data: { published },
    });
  }
}

export const vendorOpsService = new VendorOpsService();
