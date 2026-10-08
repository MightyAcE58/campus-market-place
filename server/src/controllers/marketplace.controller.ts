import { Request, Response, NextFunction } from "express";
import { marketplaceService } from "../services/marketplace.service.js";
import { sendSuccess } from "../utils/response.js";

export class MarketplaceController {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await marketplaceService.getCategories();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }

  async getVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        serviceType: req.query.serviceType as any,
        vendorId: req.query.vendorId as string,
        dietaryClassification: req.query.dietaryClassification as any,
        availableOnly: req.query.available === "true",
      };
      const vendors = await marketplaceService.getVendors(filters);
      sendSuccess(res, vendors);
    } catch (err) {
      next(err);
    }
  }

  async getVendorById(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await marketplaceService.getVendorById(req.params.vendorId);
      sendSuccess(res, vendor);
    } catch (err) {
      next(err);
    }
  }

  async getServiceConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await marketplaceService.getServiceConfig(req.params.serviceId);
      sendSuccess(res, service);
    } catch (err) {
      next(err);
    }
  }

  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.query.vendorId as string;
      const offers = await marketplaceService.getOffers(vendorId);
      sendSuccess(res, offers);
    } catch (err) {
      next(err);
    }
  }

  async getOfferById(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await marketplaceService.getOfferById(req.params.offerId);
      sendSuccess(res, offer);
    } catch (err) {
      next(err);
    }
  }
}

export const marketplaceController = new MarketplaceController();
