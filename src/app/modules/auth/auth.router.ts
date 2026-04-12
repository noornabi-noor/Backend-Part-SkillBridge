import express from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../../generated/prisma/enums";

const router = express.Router();

router.post("/register", validateRequest(authValidation.registerUserValidationSchema), authController.registerStudent);
router.post("/login", validateRequest(authValidation.signInUserValidationSchema), authController.loginStudent);
router.get("/", checkAuth(), authController.getMe);
router.post("/sign-out", checkAuth(), authController.logoutStudent);

router.post("/refresh-token", validateRequest(authValidation.getNewTokenValidationSchema), authController.getNewToken);
router.post("/change-password", checkAuth(Role.ADMIN, Role.STUDENT, Role.TUTOR), validateRequest(authValidation.changePasswordValidationSchema), authController.changePassword);

router.post("/verify-email", authController.verifyEmail);
router.post("/forget-password", validateRequest(authValidation.forgotPasswordValidationSchema), authController.forgetPassword);
router.post("/reset-password", validateRequest(authValidation.resetPasswordValidationSchema), authController.resetPassword);

router.get("/google/login", authController.googleLogin);
router.post("/google/success", authController.googleLoginSuccess);

router.get("/oauth/error", authController.handleOAuthError);

export const authRoutes = router;
