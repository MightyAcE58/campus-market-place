import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  requestOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
  vendorLoginSchema,
  vendorActivateSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post(
  "/customer/request-otp",
  validateBody(requestOtpSchema),
  authController.requestCustomerOtp.bind(authController)
);

authRouter.post(
  "/customer/verify-otp",
  validateBody(verifyOtpSchema),
  authController.verifyCustomerOtp.bind(authController)
);

authRouter.post(
  "/admin/login",
  validateBody(adminLoginSchema),
  authController.adminLogin.bind(authController)
);

authRouter.post(
  "/vendor/login",
  validateBody(vendorLoginSchema),
  authController.vendorLogin.bind(authController)
);

authRouter.post(
  "/vendor/activate",
  validateBody(vendorActivateSchema),
  authController.activateVendor.bind(authController)
);

authRouter.post("/refresh", authController.refresh.bind(authController));
authRouter.post("/logout", authController.logout.bind(authController));

authRouter.get("/me", requireAuth, authController.getMe.bind(authController));
authRouter.patch(
  "/profile",
  requireAuth,
  validateBody(updateProfileSchema),
  authController.updateProfile.bind(authController)
);
