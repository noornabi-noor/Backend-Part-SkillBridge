import express from "express";
import { tutorCategoryController } from "./tutorCategory.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { tutorCategoryValidation } from "./tutorCategory.validation";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.get("/", tutorCategoryController.getTutorCategories);
router.post("/", auth(userRoles.TUTOR), multerUpload.single("file"), validateRequest(tutorCategoryValidation.createTutorCategoryValidationSchema), tutorCategoryController.createTutorCategory);
router.delete("/:id", auth(userRoles.TUTOR), tutorCategoryController.deleteTutorCategory);

export const tutorCategoryRoutes = router;
