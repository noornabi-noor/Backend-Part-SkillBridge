import express from "express";
import { authController } from "./auth.controller";
import { auth, userRoles } from "../../middleware/auth";

import { validateRequest } from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";

const router = express.Router();

router.post("/register", validateRequest(authValidation.registerUserValidationSchema), authController.registerUser);
router.post("/login", validateRequest(authValidation.signInUserValidationSchema), authController.loginUser);
router.get("/", auth(), authController.getMe);
router.post("/sign-out", auth(), authController.signOut);

// If change password was exposed, we'd add it similarly:
// router.post("/change-password", auth(), validateRequest(authValidation.changePasswordValidationSchema), authController.changePassword);

router.get("/tutor-only", auth(userRoles.TUTOR), (req, res) => {
  res.json({ success: true, message: `Hello ${req.user?.name}, you are a tutor!` });
});

export const authRoutes = router;
