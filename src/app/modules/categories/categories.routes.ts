import express from "express"
import { categoryController } from "./categories.controller";
import { auth, userRoles } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { categoryValidation } from "./categories.validation";
import { multerUpload } from "../../config/multer.config";
import { formDataParser } from "../../middleware/formDataParser";

const router = express.Router();

router.get("/", categoryController.getAllCategory);
router.get("/:id", categoryController.getSingleCategory);
router.post(
  "/",
  auth(userRoles.ADMIN),
  multerUpload.single("icon"),
  formDataParser,
  validateRequest(categoryValidation.createCategoryValidationSchema),
  categoryController.createCategories
);
router.patch(
  "/:id",
  auth(userRoles.ADMIN),
  multerUpload.single("icon"),
  formDataParser,
  validateRequest(categoryValidation.updateCategoryValidationSchema),
  categoryController.updateCategory
);
router.delete("/:id", auth(userRoles.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;