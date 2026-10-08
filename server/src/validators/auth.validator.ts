import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  code: z.string().length(6, "OTP must be exactly 6 digits"),
  name: z.string().optional(),
  hostel: z.string().optional(),
  roomNumber: z.string().optional(),
});

export const adminLoginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
});

export const vendorLoginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(6),
});

export const vendorActivateSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  hostel: z.string().optional(),
  roomNumber: z.string().optional(),
  notificationPreferences: z
    .object({
      serviceUpdatesWhatsApp: z.boolean().optional(),
      serviceUpdatesInApp: z.boolean().optional(),
      promoWhatsApp: z.boolean().optional(),
      promoInApp: z.boolean().optional(),
    })
    .optional(),
});
