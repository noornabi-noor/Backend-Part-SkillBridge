import express from "express";
import { adminAnalyticsController } from "./adminAnalytic.controller";
import { auth, userRoles } from "../../middleware/auth";

const router = express.Router();

router.get("/dashboard", auth(userRoles.ADMIN), adminAnalyticsController.getDashboardData);
router.get("/stats", auth(userRoles.ADMIN), adminAnalyticsController.getStats);

export const adminAnalyticsRouter = router;
