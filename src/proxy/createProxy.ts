import { createProxyMiddleware } from "http-proxy-middleware";
import type { Options } from "http-proxy-middleware";
import { logger } from "../lib/logger.js";

export function createServiceProxy(target: string, pathRewrite?: Options["pathRewrite"]) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err, _req, res) => {
        logger.error({ err, target }, "Proxy error");
        if ("headersSent" in res && !res.headersSent) {
          (res as import("http").ServerResponse).writeHead(502);
        }
        res.end(
          JSON.stringify({
            success: false,
            error: {
              code: "BAD_GATEWAY",
              message: "Upstream service unavailable",
            },
          }),
        );
      },
    },
  });
}

