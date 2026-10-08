import { Router } from "express";
import { vendorController } from "../controllers/vendor.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireVendorAccess } from "../middleware/rbac.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  updateVendorProfileSchema,
  createRiderSchema,
  updateRiderSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createOfferSchema,
} from "../validators/vendor.validator.js";

export const vendorRouter = Router();

vendorRouter.use(requireAuth);
vendorRouter.use(requireVendorAccess);

// Profile & Dashboard
vendorRouter.get("/profile", vendorController.getProfile.bind(vendorController));
vendorRouter.patch(
  "/profile",
  validateBody(updateVendorProfileSchema),
  vendorController.updateProfile.bind(vendorController)
);
vendorRouter.get("/stats", vendorController.getDashboardStats.bind(vendorController));

// Riders
vendorRouter.get("/riders", vendorController.getRiders.bind(vendorController));
vendorRouter.post(
  "/riders",
  validateBody(createRiderSchema),
  vendorController.createRider.bind(vendorController)
);
vendorRouter.patch(
  "/riders/:id",
  validateBody(updateRiderSchema),
  vendorController.updateRider.bind(vendorController)
);
vendorRouter.delete("/riders/:id", vendorController.deleteRider.bind(vendorController));

// Menu items
vendorRouter.get("/menu", vendorController.getMenu.bind(vendorController));
vendorRouter.post(
  "/menu",
  validateBody(createMenuItemSchema),
  vendorController.createMenuItem.bind(vendorController)
);
vendorRouter.patch(
  "/menu/:id",
  validateBody(updateMenuItemSchema),
  vendorController.updateMenuItem.bind(vendorController)
);
vendorRouter.delete("/menu/:id", vendorController.deleteMenuItem.bind(vendorController));

// Offers
vendorRouter.get("/offers", vendorController.getOffers.bind(vendorController));
vendorRouter.post(
  "/offers",
  validateBody(createOfferSchema),
  vendorController.createOffer.bind(vendorController)
);
vendorRouter.post("/offers/:id/toggle-publish", vendorController.toggleOfferPublish.bind(vendorController));
