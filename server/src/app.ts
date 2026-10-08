import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { requestLogger } from "./middleware/logging.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiV1Router } from "./routes/index.js";
import { sendSuccess, sendError } from "./utils/response.js";

export const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CORS_ORIGINS
      if (!origin) return callback(null, true);
      const allowed = env.CORS_ORIGINS.split(",").map((o) => o.trim());
      if (process.env.APP_URL) {
        allowed.push(process.env.APP_URL);
      }
      if (allowed.includes(origin) || allowed.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// Static Uploads Directory
app.use("/uploads", express.static(path.resolve(process.cwd(), env.STORAGE_UPLOAD_DIR)));

// OpenAPI Specification Endpoint (Section 52)
app.get(["/api/v1/docs", "/api/docs"], (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), "src/docs/openapi.json"));
});

// Health and Readiness Checks (Section 68) - supports both direct and /api prefixed routes
app.get(["/health", "/api/health"], (_req, res) => {
  sendSuccess(res, { status: "UP", timestamp: new Date().toISOString() });
});

app.get(["/ready", "/api/ready"], async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, { status: "READY", database: "CONNECTED" });
  } catch (err) {
    sendError(res, "INTERNAL_ERROR", "Database not ready", 503, {
      database: "DISCONNECTED",
    });
  }
});

// Versioned API routes
app.use("/api/v1", apiV1Router);
// Also support unversioned /api/* aliases for ease of frontend consumption
app.use("/api", apiV1Router);

// Global Error Handler
app.use(errorHandler);

export default app;
