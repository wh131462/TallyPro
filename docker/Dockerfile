# ============================================================
# TallyPro Server - Multi-stage Docker Build
# ============================================================

# --- Stage 1: Build ---
FROM node:18-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

# Copy workspace config and package manifests for dependency caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/app/package.json ./packages/app/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY packages/server/src/ ./packages/server/src/
COPY packages/server/tsconfig.json ./packages/server/

# Build server
RUN pnpm --filter @tally-pro/server build

# --- Stage 2: Production ---
FROM node:18-alpine

RUN corepack enable pnpm

WORKDIR /app

# Copy workspace config and package manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Create uploads directory
RUN mkdir -p /app/packages/server/uploads

WORKDIR /app/packages/server

EXPOSE 8866

CMD ["node", "dist/app.js"]
