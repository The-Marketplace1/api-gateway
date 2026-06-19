import { Router } from "express";
import { realtimeProxy } from "../proxy/realtime.proxy.js";

const router = Router();

router.use(realtimeProxy);

export default router;

