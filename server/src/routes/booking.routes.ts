import { Router } from "express";
import { bookingController } from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { rideQuoteSchema, assignRiderSchema, updateStatusSchema } from "../validators/booking.validator.js";

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.post(
  "/ride/quote",
  validateBody(rideQuoteSchema),
  bookingController.getRideQuote.bind(bookingController)
);

bookingRouter.post("/", bookingController.createBooking.bind(bookingController));
bookingRouter.get("/", bookingController.getBookings.bind(bookingController));
bookingRouter.get("/:id", bookingController.getBookingById.bind(bookingController));
bookingRouter.post("/:id/cancel", bookingController.cancelBooking.bind(bookingController));
bookingRouter.patch(
  "/:id/status",
  validateBody(updateStatusSchema),
  bookingController.updateStatus.bind(bookingController)
);
bookingRouter.post(
  "/:id/assign-rider",
  validateBody(assignRiderSchema),
  bookingController.assignRider.bind(bookingController)
);
