import express from "express";
import { usersController } from "./user.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validation";
import { multerUpload } from "../../config/multer.config";
import { formDataParser } from "../../middleware/formDataParser";

const router = express.Router();

router.get("/:id", auth(userRoles.ADMIN, userRoles.STUDENT, userRoles.TUTOR), usersController.getUserById);
router.get("/me", auth(), usersController.getCurrentUser);
router.get("/", auth(userRoles.ADMIN), usersController.getAllUsers);

router.post(
  "/create-tutor",
  multerUpload.single("image"),
  formDataParser,
  validateRequest(userValidation.createTutorValidationSchema),
  usersController.createTutor,
);

router.patch("/:id/status", auth(userRoles.ADMIN), validateRequest(userValidation.updateUserStatusValidationSchema), usersController.updateUserStatus);
router.patch("/:id", auth(userRoles.STUDENT, userRoles.TUTOR), validateRequest(userValidation.updateUserProfileValidationSchema), usersController.updateUserProfile);

export const userRoutes = router;
