# ── Stage 1: Builder ───────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /build

# Copy workspace and root config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json build.mjs ./
COPY scripts/ ./scripts/
COPY src/ ./src/
COPY types/ ./types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build step
RUN pnpm run build

# ── Stage 2: Production ─────────────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs && adduser -S gateway -u 1001 -G nodejs

WORKDIR /app

# Copy only compiled output
COPY --from=builder /build/dist ./dist

# Ensure logs directory exists with correct permissions
RUN mkdir -p /app/logs && chown -R gateway:nodejs /app

USER gateway

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=5 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
