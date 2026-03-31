# 1. DEFINE THE BASE HERE
FROM oven/bun:1 AS base
WORKDIR /app

# 2. DEPENDENCIES
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install

# 3. BUILD
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 4. RUNNER (This refers back to stage #1)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Serve the production build and ensure bun user has permissions
COPY --chown=bun:bun --from=builder /app/package.json .
COPY --chown=bun:bun --from=builder /app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /app/dist ./dist

USER bun
EXPOSE 5173

CMD ["bun", "run", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]