import express from "express";
import { availabiltyController } from "./availability.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { availabilityValidation } from "./availability.validation";

const router = express.Router();

router.get("/", availabiltyController.getAllAvailabilty);
router.get("/me", auth(userRoles.TUTOR), availabiltyController.getMyAvailability);
router.get("/tutor/:tutorId", availabiltyController.getAvailabilityByTutor);
router.get("/:id", availabiltyController.getSingleAvailability);
router.post("/me", auth(userRoles.TUTOR), validateRequest(availabilityValidation.createAvailabilityValidationSchema), availabiltyController.createAvailability);
router.patch("/:id", auth(userRoles.TUTOR), validateRequest(availabilityValidation.updateAvailabilityValidationSchema), availabiltyController.updateAvailability);
router.delete("/:id", auth(userRoles.TUTOR), availabiltyController.deleteAvailability);

export const availabilityRoutes = router;
