import { createServiceProxy } from "./createProxy.js";
import { env } from "../config/env.js";

export const paymentProxy = createServiceProxy(env.PAYMENT_SERVICE_URL);

