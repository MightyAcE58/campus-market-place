import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { rotateRefreshToken, revokeRefreshToken } from "../auth/jwt.js";
import { sendSuccess } from "../utils/response.js";

export class AuthController {
  async requestCustomerOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestCustomerOtp(req.body.phone, req.ip);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async verifyCustomerOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyCustomerOtp({
        phone: req.body.phone,
        code: req.body.code,
        name: req.body.name,
        hostel: req.body.hostel,
        roomNumber: req.body.roomNumber,
        ipAddress: req.ip,
      });
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.adminLogin(req.body.phone, req.body.password, req.ip);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async vendorLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.vendorLogin(req.body.emailOrPhone, req.body.password, req.ip);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async activateVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.activateVendor(req.body.token, req.body.password);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken;
      const result = await rotateRefreshToken(refreshToken);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.refreshToken) {
        await revokeRefreshToken(req.body.refreshToken);
      }
      sendSuccess(res, { message: "Logged out successfully" }, 200);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await authService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
