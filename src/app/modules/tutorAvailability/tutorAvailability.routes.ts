import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { TutorAvailabilityController } from "./tutorAvailability.controller";
import { TutorAvailabilityValidation } from "./tutorAvailability.validation";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.post("/create-my-availability",
    checkAuth(Role.TUTOR),
    validateRequest(TutorAvailabilityValidation.createTutorAvailabilityZodSchema),
    TutorAvailabilityController.createMyTutorAvailability);
router.get("/my-availabilities",
    checkAuth(Role.TUTOR),
    TutorAvailabilityController.getMyTutorAvailabilities);
router.get("/",
    checkAuth(Role.ADMIN),
    TutorAvailabilityController.getAllTutorAvailabilities);
router.get("/:tutorId/availability/:availabilityId",
    TutorAvailabilityController.getTutorAvailabilityById);
router.patch("/update-my-availability",
    checkAuth(Role.TUTOR),
    validateRequest(TutorAvailabilityValidation.updateTutorAvailabilityZodSchema),
    TutorAvailabilityController.updateMyTutorAvailability);
router.delete("/delete-my-availability/:id",
    checkAuth(Role.TUTOR),
    TutorAvailabilityController.deleteMyTutorAvailability);

export const TutorAvailabilityRoutes = router;