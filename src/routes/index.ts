import { Router } from "express";
import healthRouter from "./health.js";
import authRoutes from "./auth.routes.js";
import apiRoutes from "./api.routes.js";
import paymentRoutes from "./payment.routes.js";
import realtimeRoutes from "./realtime.routes.js";
import notificationRoutes from "./notification.routes.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRoutes);

router.use("/payments", authMiddleware, paymentRoutes);
router.use("/realtime", authMiddleware, realtimeRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);
router.use("/", authMiddleware, apiRoutes);

export default router;
