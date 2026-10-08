import { Router } from "express";
import { marketplaceController } from "../controllers/marketplace.controller.js";

export const marketplaceRouter = Router();

marketplaceRouter.get("/categories", marketplaceController.getCategories.bind(marketplaceController));
marketplaceRouter.get("/vendors", marketplaceController.getVendors.bind(marketplaceController));
marketplaceRouter.get("/vendors/:vendorId", marketplaceController.getVendorById.bind(marketplaceController));
marketplaceRouter.get("/services/:serviceId", marketplaceController.getServiceConfig.bind(marketplaceController));
marketplaceRouter.get("/offers", marketplaceController.getOffers.bind(marketplaceController));
marketplaceRouter.get("/offers/:offerId", marketplaceController.getOfferById.bind(marketplaceController));
