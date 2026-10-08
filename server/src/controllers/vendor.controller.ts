import { Request, Response, NextFunction } from "express";
import { vendorOpsService } from "../services/vendor-ops.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/errors.js";

export class VendorController {
  private getVendorId(req: Request): string {
    const id = req.user?.vendorId;
    if (!id) {
      throw new AppError("FORBIDDEN", "No vendor profile linked to this account.", 403);
    }
    return id;
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const profile = await vendorOpsService.getVendorProfile(vendorId);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const updated = await vendorOpsService.updateVendorProfile(vendorId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const stats = await vendorOpsService.getDashboardStats(vendorId);
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }

  // Riders
  async getRiders(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const riders = await vendorOpsService.getRiders(vendorId);
      sendSuccess(res, riders);
    } catch (err) {
      next(err);
    }
  }

  async createRider(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const rider = await vendorOpsService.createRider(vendorId, req.body);
      sendSuccess(res, rider, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRider(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const rider = await vendorOpsService.updateRider(req.params.id, vendorId, req.body);
      sendSuccess(res, rider);
    } catch (err) {
      next(err);
    }
  }

  async deleteRider(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      await vendorOpsService.deleteRider(req.params.id, vendorId);
      sendSuccess(res, { message: "Rider deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  // Menu items
  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const items = await vendorOpsService.getMenuItems(vendorId);
      sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  }

  async createMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const item = await vendorOpsService.createMenuItem(vendorId, req.body);
      sendSuccess(res, item, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await vendorOpsService.updateMenuItem(req.params.id, req.body);
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  }

  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      await vendorOpsService.deleteMenuItem(req.params.id);
      sendSuccess(res, { message: "Item deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  // Offers
  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const offers = await vendorOpsService.getOffers(vendorId);
      sendSuccess(res, offers);
    } catch (err) {
      next(err);
    }
  }

  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const offer = await vendorOpsService.createOffer(vendorId, req.body);
      sendSuccess(res, offer, 201);
    } catch (err) {
      next(err);
    }
  }

  async toggleOfferPublish(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = this.getVendorId(req);
      const published = req.body.published !== false;
      const offer = await vendorOpsService.setOfferPublishStatus(req.params.id, vendorId, published);
      sendSuccess(res, offer);
    } catch (err) {
      next(err);
    }
  }
}

export const vendorController = new VendorController();
