import { Router } from "express";
import healthRouter from "./health.js";
import authRoutes from "./auth.routes.js";
import apiRoutes from "./api.routes.js";
import paymentRoutes from "./payment.routes.js";
import realtimeRoutes from "./realtime.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = Router();

router.use(healthRouter);

router.use("/auth", authRoutes);
router.use("/payments", paymentRoutes);
router.use("/realtime", realtimeRoutes);
router.use("/notifications", notificationRoutes);

router.use("/", apiRoutes);

export default router;

