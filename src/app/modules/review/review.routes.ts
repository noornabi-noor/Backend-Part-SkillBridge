import express from "express";
import { reviewController } from "./review.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { reviewValidation } from "./review.validation";

const router = express.Router();

router.get("/admin", auth(userRoles.ADMIN), reviewController.getReviews);
router.get("/tutor/:id", auth(userRoles.TUTOR), reviewController.getReviewsByTutor);
router.get("/", reviewController.getReviews)
router.post("/", auth(userRoles.STUDENT), validateRequest(reviewValidation.createReviewValidationSchema), reviewController.createReview)
router.patch("/:id", auth(userRoles.STUDENT), validateRequest(reviewValidation.updateReviewValidationSchema), reviewController.updateReview);
router.delete("/admin/:id", auth(userRoles.ADMIN), reviewController.deleteReview);
router.delete("/:id", auth(userRoles.STUDENT), reviewController.deleteReview);

export const reviewRoutes = router;