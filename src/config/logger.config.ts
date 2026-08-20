import type { Options as PinoHttpOptions } from "pino-http";
import { logger } from "../lib/logger.js";
import { LOG_CONTEXT } from "../constants/platform.constants.js";

export function buildPinoHttpOptions(): PinoHttpOptions {
  return {
    logger,
    customProps: () => LOG_CONTEXT,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: (req.url as string)?.split("?")[0],
          ...LOG_CONTEXT,
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
    customSuccessMessage(req, res) {
      return `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] ${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage(req, res, err) {
      return `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] ${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
  };
}

