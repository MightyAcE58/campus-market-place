import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.js";
import { AccessStatus } from "@prisma/client";

export class AdminController {
  async onboardVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.onboardVendor(req.user!.userId, req.body);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async getVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const vendors = await adminService.getVendors(req.query.search as string);
      sendSuccess(res, vendors);
    } catch (err) {
      next(err);
    }
  }

  async getVendorById(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await adminService.getVendorById(req.params.id);
      sendSuccess(res, vendor);
    } catch (err) {
      next(err);
    }
  }

  async suspendVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await adminService.updateVendorStatus(
        req.params.id,
        AccessStatus.SUSPENDED,
        req.user!.userId
      );
      sendSuccess(res, vendor);
    } catch (err) {
      next(err);
    }
  }

  async activateVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await adminService.updateVendorStatus(
        req.params.id,
        AccessStatus.ACTIVE,
        req.user!.userId
      );
      sendSuccess(res, vendor);
    } catch (err) {
      next(err);
    }
  }

  async removeVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await adminService.updateVendorStatus(
        req.params.id,
        AccessStatus.REMOVED,
        req.user!.userId
      );
      sendSuccess(res, vendor);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getUsers(req.query.search as string);
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getPlatformStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async getActivityLogs(_req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await adminService.getActivityLogs();
      sendSuccess(res, logs);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
