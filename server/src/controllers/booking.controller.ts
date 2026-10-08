import { Request, Response, NextFunction } from "express";
import { bookingService } from "../services/booking.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/errors.js";
import { VendorType } from "@prisma/client";

export class BookingController {
  async getRideQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const quote = await bookingService.calculateRideQuote({
        serviceId: req.body.serviceId,
        pickup: req.body.pickup,
        dropoff: req.body.dropoff,
        passengers: req.body.passengers,
      });
      sendSuccess(res, quote);
    } catch (err) {
      next(err);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const idempotencyKey = (req.headers["idempotency-key"] as string) || req.body.idempotencyKey;
      const serviceType = req.body.serviceType as VendorType;

      let booking;
      if (serviceType === VendorType.BIKE_RIDE || req.body.pickup) {
        booking = await bookingService.createRideBooking(customerId, {
          serviceId: req.body.serviceId,
          pickup: req.body.pickup,
          dropoff: req.body.dropoff,
          date: req.body.date,
          time: req.body.time,
          passengers: req.body.passengers,
          idempotencyKey,
        });
      } else if (serviceType === VendorType.LAUNDRY || req.body.clothingItems) {
        booking = await bookingService.createLaundryBooking(customerId, {
          serviceId: req.body.serviceId,
          laundryService: req.body.laundryService || "Wash + Iron",
          clothingItems: req.body.clothingItems,
          bagPhotoUrl: req.body.bagPhotoUrl,
          idempotencyKey,
        });
      } else if (serviceType === VendorType.FOOD || req.body.items) {
        booking = await bookingService.createFoodBooking(customerId, {
          serviceId: req.body.serviceId,
          items: req.body.items,
          collectionPoint: req.body.collectionPoint,
          idempotencyKey,
        });
      } else {
        throw new AppError("INVALID_SERVICE_CONFIGURATION", "Unrecognized booking payload.", 400);
      }

      sendSuccess(res, booking, 201);
    } catch (err) {
      next(err);
    }
  }

  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await bookingService.getBookings({
        userId: req.user!.userId,
        role: req.user!.role,
        vendorId: req.user!.vendorId,
        status: req.query.status as string,
        serviceType: req.query.serviceType as any,
        page,
        limit,
      });

      sendSuccess(res, result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (err) {
      next(err);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getBookingById(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.cancelBooking(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.updateStatus(
        req.params.id,
        req.body.status,
        req.user!.userId,
        req.body.notes
      );
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }

  async assignRider(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.assignRider(
        req.params.id,
        req.body.riderId,
        req.user!.userId
      );
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
