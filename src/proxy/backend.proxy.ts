import { createServiceProxy } from "./createProxy.js";
import { env } from "../config/env.js";

export const backendProxy = createServiceProxy(env.BACKEND_API_URL);

