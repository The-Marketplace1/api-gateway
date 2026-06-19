# ── Stage 1: Builder ───────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /build

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY scripts/ ./scripts/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/api-server/tsconfig.json ./artifacts/api-server/
COPY artifacts/api-server/build.mjs ./artifacts/api-server/
COPY artifacts/api-server/src/ ./artifacts/api-server/src/

# Install dependencies (IMPORTANT: use workspaces correctly)
RUN pnpm install --frozen-lockfile

WORKDIR /build/artifacts/api-server

# Build step
RUN node ./build.mjs


# ── Stage 2: Production ─────────────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs && adduser -S gateway -u 1001 -G nodejs

WORKDIR /app

# Copy only compiled output
COPY --from=builder /build/artifacts/api-server/dist ./dist

# IMPORTANT FIX: ensure logs directory exists with correct permissions
RUN mkdir -p /app/logs && chown -R gateway:nodejs /app

USER gateway

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# HEALTHCHECK FIX: use interval-safe retry endpoint check
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=5 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
