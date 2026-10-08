import { z } from "zod";

export const updateVendorProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  whatsappNumber: z.string().min(10).optional(),
  description: z.string().optional(),
  serviceArea: z.string().optional(),
  operatingHours: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dietaryClassification: z.enum(["VEG_ONLY", "VEG_AND_NON_VEG"]).optional(),
  minimumOrder: z.number().min(0).optional(),
});

export const createRiderSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  vehicleIdentifier: z.string().min(2),
});

export const updateRiderSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  vehicleIdentifier: z.string().min(2).optional(),
  active: z.boolean().optional(),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().min(0),
  category: z.string().optional(),
  dietaryClassification: z.enum(["VEG", "NON_VEG"]).default("VEG"),
  color: z.string().optional(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  available: z.boolean().optional(),
  dietaryClassification: z.enum(["VEG", "NON_VEG"]).optional(),
});

export const createOfferSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  applicableItem: z.string().optional(),
  originalPrice: z.number().optional(),
  offerPrice: z.number().min(0),
  startAt: z.string(),
  endAt: z.string(),
  eligibility: z.string().optional(),
  location: z.string().optional(),
});

export const updateOfferSchema = createOfferSchema.partial().extend({
  published: z.boolean().optional(),
});
