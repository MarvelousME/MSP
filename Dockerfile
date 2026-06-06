# ---- Base ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema (needed for migrations at runtime)
COPY --from=builder /app/prisma ./prisma

RUN chown -R nextjs:nodejs /app/prisma

# Create graceful startup script
COPY --chown=nextjs:nodejs <<'EOF' /app/start.sh
#!/bin/sh
set -e

echo "[startup] Running Prisma migrations..."
if ! npx prisma migrate deploy 2>&1; then
  echo "[startup] WARNING: Migration failed — continuing anyway (DB may already be up to date)"
fi

echo "[startup] Starting Next.js on port 2020..."
exec node server.js
EOF

RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 2020
ENV PORT=2020
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "/app/start.sh"]
