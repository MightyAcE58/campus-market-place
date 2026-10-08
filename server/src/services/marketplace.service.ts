import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/errors.js";
import { AccessStatus, DietaryClassification, VendorType } from "@prisma/client";

export interface MarketplaceFilters {
  search?: string;
  category?: string;
  serviceType?: VendorType;
  vendorId?: string;
  dietaryClassification?: DietaryClassification;
  availableOnly?: boolean;
}

export class MarketplaceService {
  async getCategories() {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { id: "asc" },
    });
  }

  async getVendors(filters: MarketplaceFilters) {
    const whereClause: Record<string, unknown> = {
      accessStatus: { in: [AccessStatus.ACTIVE, AccessStatus.TRIAL] },
    };

    if (filters.serviceType) {
      whereClause.vendorType = filters.serviceType;
    }

    if (filters.category) {
      const typeMap: Record<string, VendorType> = {
        ride: VendorType.BIKE_RIDE,
        laundry: VendorType.LAUNDRY,
        food: VendorType.FOOD,
      };
      if (typeMap[filters.category.toLowerCase()]) {
        whereClause.vendorType = typeMap[filters.category.toLowerCase()];
      }
    }

    if (filters.dietaryClassification) {
      whereClause.dietaryClassification = filters.dietaryClassification;
    }

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      include: {
        services: {
          where: { active: true },
          select: { id: true, name: true, serviceType: true, description: true },
        },
        offers: {
          where: {
            published: true,
            startAt: { lte: new Date() },
            endAt: { gte: new Date() },
          },
          select: { id: true, title: true, offerPrice: true, originalPrice: true },
        },
      },
      orderBy: { businessName: "asc" },
    });

    // In-memory text search over name, description, tags, and service names if search query provided
    let results = vendors;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((v) => {
        const tagList = Array.isArray(v.tags) ? (v.tags as string[]).join(" ") : "";
        const serviceNames = v.services.map((s) => s.name).join(" ");
        const corpus = `${v.businessName} ${v.description || ""} ${v.ownerName} ${tagList} ${serviceNames}`.toLowerCase();
        return corpus.includes(q);
      });
    }

    return results.map((v) => ({
      id: v.id,
      name: v.businessName,
      type:
        v.vendorType === VendorType.FOOD
          ? v.dietaryClassification === DietaryClassification.VEG_ONLY
            ? "Veg-only"
            : "Food & Meals"
          : v.vendorType === VendorType.LAUNDRY
          ? "Wash + Iron"
          : "Bike rides",
      category:
        v.vendorType === VendorType.BIKE_RIDE
          ? "ride"
          : v.vendorType === VendorType.LAUNDRY
          ? "laundry"
          : "food",
      description: v.description || "",
      area: v.serviceArea || "Campus-wide",
      status: v.marketplaceStatus === "OPEN" ? "Available now" : "Closed",
      price:
        v.vendorType === VendorType.BIKE_RIDE
          ? "Fares from ₹40"
          : v.vendorType === VendorType.LAUNDRY
          ? "From ₹80/kg"
          : "Meals from ₹70",
      color: v.color || "sage",
      mark: v.mark || v.businessName.substring(0, 2).toUpperCase(),
      offer: v.offers[0]?.title || "",
      tags: Array.isArray(v.tags) ? (v.tags as string[]) : [],
      services: v.services.map((s) => s.name),
      serviceArea: v.serviceArea,
      operatingHours: v.operatingHours,
      dietaryClassification: v.dietaryClassification,
    }));
  }

  async getVendorById(vendorId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        services: {
          where: { active: true },
          include: {
            configuration: true,
            locations: { where: { active: true } },
            clothingTypes: { where: { allowed: true } },
            laundryServiceTypes: true,
            menuItems: { where: { available: true } },
          },
        },
        offers: {
          where: { published: true },
        },
      },
    });

    if (!vendor) {
      throw new AppError("NOT_FOUND", "Vendor not found.", 404);
    }

    return vendor;
  }

  async getServiceConfig(serviceId: string) {
    const service = await prisma.vendorService.findUnique({
      where: { id: serviceId },
      include: {
        vendor: true,
        configuration: true,
        locations: { where: { active: true } },
        clothingTypes: true,
        laundryServiceTypes: true,
        menuItems: { where: { available: true } },
        fareRules: true,
      },
    });

    if (!service) {
      throw new AppError("NOT_FOUND", "Service not found.", 404);
    }

    return service;
  }

  async getOffers(vendorId?: string) {
    const whereClause: Record<string, unknown> = {
      published: true,
      startAt: { lte: new Date() },
      endAt: { gte: new Date() },
    };

    if (vendorId) {
      whereClause.vendorId = vendorId;
    }

    return prisma.offer.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            vendorType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOfferById(offerId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        vendor: true,
      },
    });

    if (!offer) {
      throw new AppError("NOT_FOUND", "Offer not found.", 404);
    }

    return offer;
  }
}

export const marketplaceService = new MarketplaceService();
