import { SERVICES, type ServiceConfig } from "../config/services.config.js";
import { PUBLIC_ROUTES } from "../constants/routes.constants.js";
import { logger } from "../lib/logger.js";
import { LOG_CONTEXT } from "../constants/platform.constants.js";

export function resolveService(path: string): ServiceConfig | undefined {
  const service = Object.values(SERVICES).find((svc) =>
    path.startsWith(svc.path),
  );

  if (service) {
    logger.debug(
      {
        ...LOG_CONTEXT,
        event: "route_resolved",
        path,
        targetService: service.name,
        targetUrl: service.url,
      },
      `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] Route resolved: ${path} → ${service.name}`,
    );
  } else {
    logger.warn(
      {
        ...LOG_CONTEXT,
        event: "route_not_found",
        path,
      },
      `[${LOG_CONTEXT.platform} ${LOG_CONTEXT.service}] No service found for path: ${path}`,
    );
  }

  return service;
}

export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(route + "/"),
  );
}

export function listServices(): ServiceConfig[] {
  return Object.values(SERVICES);
}

