import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { marketplaceRouter } from "./marketplace.routes.js";
import { bookingRouter } from "./booking.routes.js";
import { vendorRouter } from "./vendor.routes.js";
import { adminRouter } from "./admin.routes.js";
import { uploadSingle, handleFileUpload } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/marketplace", marketplaceRouter);
apiV1Router.use("/", marketplaceRouter); // Provides /categories, /vendors, /services, /offers aliases
apiV1Router.use("/bookings", bookingRouter);
apiV1Router.use("/vendor", vendorRouter);
apiV1Router.use("/admin", adminRouter);

apiV1Router.post("/upload", requireAuth, uploadSingle, handleFileUpload);
