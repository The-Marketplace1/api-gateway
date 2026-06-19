import { createServiceProxy } from "./createProxy.js";
import { env } from "../config/env.js";

export const notificationProxy = createServiceProxy(
  env.NOTIFICATION_SERVICE_URL,
);

