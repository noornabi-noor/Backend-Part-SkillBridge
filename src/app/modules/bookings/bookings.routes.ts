import express from "express";
import { bookingController } from "./bookings.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { bookingValidation } from "./bookings.validation";

const router = express.Router();

router.get("/me", auth(userRoles.STUDENT), bookingController.getMyBookings);
router.get("/tutor/:id", auth(userRoles.TUTOR, userRoles.ADMIN), bookingController.getBookingsByTutor);
router.get("/", auth(userRoles.ADMIN), bookingController.getAllBookings);
router.get("/:id", auth(userRoles.ADMIN, userRoles.TUTOR, userRoles.STUDENT), bookingController.getBookingById);
router.post(
    "/",
    auth(userRoles.STUDENT),
    validateRequest(bookingValidation.createBookingValidationSchema),
    bookingController.createBooking
);
router.patch(
    "/:id",
    auth(userRoles.ADMIN, userRoles.TUTOR, userRoles.STUDENT),
    validateRequest(bookingValidation.updateBookingValidationSchema),
    bookingController.updateBooking
);
router.delete(
    "/:id",
    auth(userRoles.ADMIN, userRoles.TUTOR),
    bookingController.deleteBooking
);

export const bookingRoutes = router;