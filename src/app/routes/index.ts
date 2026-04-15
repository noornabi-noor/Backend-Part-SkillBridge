import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.router";
import { categoryRoutes } from "../modules/categories/categories.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { tutorRoutes } from "../modules/tutor/tutor.routes";
import { tutorCategoryRoutes } from "../modules/tutorCategory/tutorCategory.routes";
import { userRoutes } from "../modules/users/user.routes";
import { availabilityRoutes } from "../modules/availability/availability.routes";
import { bookingRoutes } from "../modules/bookings/bookings.routes";
import { TutorAvailabilityRoutes } from "../modules/tutorAvailability/tutorAvailability.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/tutors", tutorRoutes);
router.use("/tutor-categories", tutorCategoryRoutes);
router.use("/users", userRoutes);
router.use("/availability", availabilityRoutes);
router.use("/tutor-availability", TutorAvailabilityRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

export const indexRoutes = router;
