import { createServiceProxy } from "./createProxy.js";
import { env } from "../config/env.js";

export const realtimeProxy = createServiceProxy(env.REALTIME_SERVICE_URL);

