import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { onboardVendorSchema } from "../validators/admin.validator.js";
import { Role } from "@prisma/client";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole(Role.ADMIN));

adminRouter.post(
  "/vendors",
  validateBody(onboardVendorSchema),
  adminController.onboardVendor.bind(adminController)
);
adminRouter.get("/vendors", adminController.getVendors.bind(adminController));
adminRouter.get("/vendors/:id", adminController.getVendorById.bind(adminController));
adminRouter.post("/vendors/:id/suspend", adminController.suspendVendor.bind(adminController));
adminRouter.post("/vendors/:id/activate", adminController.activateVendor.bind(adminController));
adminRouter.post("/vendors/:id/remove", adminController.removeVendor.bind(adminController));

adminRouter.get("/users", adminController.getUsers.bind(adminController));
adminRouter.get("/stats", adminController.getStats.bind(adminController));
adminRouter.get("/activity", adminController.getActivityLogs.bind(adminController));
