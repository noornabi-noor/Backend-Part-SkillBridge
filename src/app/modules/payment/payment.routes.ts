import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth, userRoles } from "../../middleware/auth";

const router = Router();

router.post(
  "/initiate/:bookingId",
  auth(userRoles.STUDENT),
  paymentController.initiatePayment
);

export const paymentRoutes = router;
