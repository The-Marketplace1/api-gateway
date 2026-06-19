import { Router } from "express";
import { paymentProxy } from "../proxy/payment.proxy.js";

const router = Router();

router.use(paymentProxy);

export default router;

