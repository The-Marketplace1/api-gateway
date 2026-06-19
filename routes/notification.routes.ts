import { Router } from "express";
import { notificationProxy } from "../proxy/notification.proxy.js";

const router = Router();

router.use(notificationProxy);

export default router;

