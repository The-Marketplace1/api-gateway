import { Router } from "express";
import { communicationProxy } from "../proxy/communication.proxy.js";

const router = Router();

router.use(communicationProxy);

export default router;

