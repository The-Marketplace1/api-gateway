import { createServiceProxy } from "./createProxy.js";
import { env } from "../config/env.js";

export const authProxy = createServiceProxy(env.AUTH_SERVICE_URL);

