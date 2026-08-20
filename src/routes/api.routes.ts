import { Router } from "express";
import { backendProxy } from "../proxy/backend.proxy.js";

const router = Router();

router.use(backendProxy);

export default router;

