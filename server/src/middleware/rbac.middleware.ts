import { Request, Response, NextFunction } from "express";
import { Role, AccessStatus } from "@prisma/client";
import { AppError } from "../utils/errors.js";
import { prisma } from "../db/prisma.js";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("UNAUTHORIZED", "Authentication required.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "FORBIDDEN",
          `Access forbidden for role ${req.user.role}. Required: ${allowedRoles.join(", ")}`,
          403
        )
      );
    }

    next();
  };
}

export async function requireVendorAccess(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new AppError("UNAUTHORIZED", "Authentication required.", 401));
    }

    if (req.user.role === Role.ADMIN) {
      return next(); // Admins bypass vendor checks
    }

    if (req.user.role !== Role.VENDOR_OWNER) {
      return next(new AppError("FORBIDDEN", "Vendor access required.", 403));
    }

    // Resolve vendor record
    let vendorId = req.user.vendorId;
    if (!vendorId) {
      const vendor = await prisma.vendor.findFirst({
        where: { ownerId: req.user.userId },
        select: { id: true, accessStatus: true, accessEnd: true },
      });
      if (!vendor) {
        return next(new AppError("FORBIDDEN", "No vendor profile found for this account.", 403));
      }
      vendorId = vendor.id;
      req.user.vendorId = vendor.id;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { accessStatus: true, accessEnd: true },
    });

    if (!vendor) {
      return next(new AppError("FORBIDDEN", "Vendor not found.", 403));
    }

    if (vendor.accessStatus === AccessStatus.REMOVED) {
      return next(new AppError("FORBIDDEN", "Vendor account has been removed.", 403));
    }

    if (vendor.accessStatus === AccessStatus.SUSPENDED) {
      return next(
        new AppError("VENDOR_SUSPENDED", "Vendor services are suspended by platform administrator.", 403)
      );
    }

    if (
      vendor.accessStatus === AccessStatus.EXPIRED ||
      (vendor.accessEnd && vendor.accessEnd < new Date())
    ) {
      return next(
        new AppError("VENDOR_EXPIRED", "Vendor access plan has expired.", 403)
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
