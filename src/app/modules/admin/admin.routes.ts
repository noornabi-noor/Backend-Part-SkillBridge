import express from "express";
import { adminController } from "./admin.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { adminValidation } from "./admin.validation";

const router = express.Router();

router.get("/users", auth(userRoles.ADMIN), adminController.getAllUsers);
router.patch("/users/:id", auth(userRoles.ADMIN), validateRequest(adminValidation.updateUserValidationSchema), adminController.updateUser);
router.get("/tutor", auth(userRoles.ADMIN), adminController.getAllTutor);
router.get("/bookings", auth(userRoles.ADMIN), adminController.getAllBookings);
router.get("/dashboard", auth(userRoles.ADMIN), adminController.getDashboardStats);
router.post("/categories", auth(userRoles.ADMIN), validateRequest(adminValidation.createCategoryValidationSchema), adminController.createCategory);
router.patch("/categories/:id", auth(userRoles.ADMIN), validateRequest(adminValidation.updateCategoryValidationSchema), adminController.updateCategory);

export const adminRouter = router;