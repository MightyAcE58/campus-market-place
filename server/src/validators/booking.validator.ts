import { z } from "zod";

export const rideQuoteSchema = z.object({
  serviceId: z.string().optional(),
  pickup: z.string().min(1, "Pickup location is required"),
  dropoff: z.string().min(1, "Dropoff location is required"),
  passengers: z
    .number()
    .int()
    .min(1, "At least 1 passenger")
    .max(2, "Maximum 2 passengers permitted"),
});

export const createRideBookingSchema = z.object({
  serviceId: z.string(),
  pickup: z.string().min(1),
  dropoff: z.string().min(1),
  date: z.string(),
  time: z.string(),
  passengers: z.number().int().min(1).max(2),
  idempotencyKey: z.string().optional(),
});

export const createLaundryBookingSchema = z.object({
  serviceId: z.string(),
  laundryService: z.string().min(1), // e.g. "Wash Only", "Wash + Iron", "Iron Only"
  clothingItems: z.record(z.string(), z.number().int().min(0)),
  bagPhotoUrl: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const createFoodBookingSchema = z.object({
  serviceId: z.string(),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Basket must contain at least 1 item"),
  collectionPoint: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const assignRiderSchema = z.object({
  riderId: z.string().min(1, "Rider ID is required"),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "ASSIGNED",
    "ACCEPTED",
    "RECEIVED",
    "PREPARING",
    "PROCESSING",
    "READY",
    "COMPLETED",
    "CANCELLED",
    "ON_THE_WAY",
  ]),
  notes: z.string().optional(),
});
