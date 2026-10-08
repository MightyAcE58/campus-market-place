import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().default("http://localhost:8000"),
  APP_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:8443,http://127.0.0.1:8443,http://localhost:3000"),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string().default("super-secret-jwt-key-campus-commerce-mvp-2025-token-change-in-prod"),
  JWT_REFRESH_SECRET: z.string().default("super-secret-refresh-key-campus-commerce-mvp-2025-session-token"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  OTP_SECRET: z.string().default("campus-commerce-otp-hmac-salt-secret-key-2025"),
  OTP_EXPIRY_SECONDS: z.coerce.number().default(300),

  WHATSAPP_PROVIDER: z.enum(["MOCK", "META", "TWILIO"]).default("MOCK"),
  WHATSAPP_API_URL: z.string().default("https://api.whatsapp.example.com/v1/messages"),
  WHATSAPP_API_TOKEN: z.string().default("mock_whatsapp_token_campus_commerce"),

  STORAGE_PROVIDER: z.enum(["LOCAL", "S3"]).default("LOCAL"),
  STORAGE_UPLOAD_DIR: z.string().default("./uploads"),
  STORAGE_BUCKET: z.string().default("campus-commerce-assets"),
  STORAGE_REGION: z.string().default("ap-south-1"),
  STORAGE_ACCESS_KEY: z.string().default("mock_access_key"),
  STORAGE_SECRET_KEY: z.string().default("mock_secret_key"),

  EMAIL_PROVIDER: z.enum(["MOCK", "SMTP"]).default("MOCK"),
  EMAIL_FROM: z.string().default("noreply@campuscommerce.in"),
});

export const env = envSchema.parse(process.env);
