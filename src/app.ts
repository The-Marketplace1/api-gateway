import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import pinoHttp from "pino-http";
import { buildCorsOptions } from "./config/cors.config.js";
import { buildPinoHttpOptions } from "./config/logger.config.js";
import { logger } from "./lib/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import {
  platformIdentityMiddleware,
  requestContextMiddleware,
  sanitizePayloadMiddleware,
} from "./middleware/security.middleware.js";
import {
  globalAnonymousLimiter,
  globalAuthenticatedLimiter,
} from "./middleware/rateLimit.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";
import {
  validateHeaders,
  rejectMalformedJson,
} from "./validators/gateway.validator.js";
import router from "./routes/index.js";
import { LOG_CONTEXT } from "./constants/platform.constants.js";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xPoweredBy: false,
  }),
);

app.use(cors(buildCorsOptions()));

app.use(pinoHttp(buildPinoHttpOptions()));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(rejectMalformedJson);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(requestIdMiddleware);
app.use(platformIdentityMiddleware);
app.use(requestContextMiddleware);

app.use(validateHeaders);
app.use(sanitizePayloadMiddleware);

app.use(globalAnonymousLimiter);
app.use(globalAuthenticatedLimiter);

app.use(authMiddleware);

app.use("/api", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

logger.info(
  { ...LOG_CONTEXT, event: "app_initialized" },
  `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] Gateway application initialized`,
);

export default app;

