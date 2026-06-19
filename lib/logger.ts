import pino from "pino";
import { LOG_CONTEXT } from "../constants/platform.constants.js";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: {
      ...LOG_CONTEXT,
      pid: process.pid,
    },
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
    ],
    ...(isProduction
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              messageFormat: `[{platform} {service}] {msg}`,
            },
          },
        }),
  },
);

