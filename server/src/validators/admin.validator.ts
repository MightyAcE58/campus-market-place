import { z } from "zod";

export const onboardVendorSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  whatsappNumber: z.string().min(10),
  vendorType: z.enum(["BIKE_RIDE", "LAUNDRY", "FOOD"]),
  accessPlan: z.enum(["PAID", "FREE", "TRIAL"]).default("PAID"),
  accessStartDate: z.string(),
  accessEndDate: z.string(),
  monthlyPrice: z.number().min(0).default(0),
  serviceArea: z.string().optional(),
  description: z.string().optional(),
});

export const updateVendorAdminSchema = z.object({
  businessName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  whatsappNumber: z.string().min(10).optional(),
  accessPlan: z.enum(["PAID", "FREE", "TRIAL"]).optional(),
  accessEndDate: z.string().optional(),
  monthlyPrice: z.number().min(0).optional(),
  accessStatus: z.enum(["INVITED", "ACTIVE", "TRIAL", "SUSPENDED", "EXPIRED", "REMOVED"]).optional(),
});
