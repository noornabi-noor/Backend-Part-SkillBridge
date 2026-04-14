import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { availabilityController } from "./availability.controller";
import { availabilityValidation } from "./availability.validation";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.post(
    '/',
    checkAuth(Role.ADMIN),
    validateRequest(availabilityValidation.createAvailabilityZodSchema),
    availabilityController.createAvailability
);
router.get(
    '/',
    availabilityController.getAllAvailabilities
);
router.get(
    '/:id',
    availabilityController.getAvailabilityById
);
router.patch(
    '/:id',
    checkAuth(Role.ADMIN),
    validateRequest(availabilityValidation.updateAvailabilityZodSchema),
    availabilityController.updateAvailability
);
router.delete(
    '/:id',
    checkAuth(Role.ADMIN),
    availabilityController.deleteAvailability
);

export const availabilityRoutes = router;