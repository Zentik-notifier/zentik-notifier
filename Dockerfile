# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci || npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
# Copy the pre-built frontend into backend's public folder
COPY frontend/dist ./public
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Install tools needed at runtime (pg_dump for backups, certs, timezone data)
RUN apk add --no-cache postgresql-client ca-certificates tzdata \
  && update-ca-certificates
# Install only production deps
COPY backend/package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
# Copy built dist
COPY --from=builder /app/dist ./dist
# Copy the frontend files
COPY --from=builder /app/public ./public
# Ensure backup directory exists (adjust if using a bind mount)
RUN mkdir -p /data/storage/backups
# Copy any runtime files (e.g., swagger ui assets if needed)
EXPOSE 3000
CMD ["node", "dist/main.js"]
