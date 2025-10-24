# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app-template
COPY backend/package*.json ./
RUN npm ci || npm install

FROM node:22-alpine AS builder
WORKDIR /app-template
COPY --from=deps /app-template/node_modules ./node_modules
COPY backend/ .
COPY frontend/dist ./public
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app-template
ENV NODE_ENV=production
RUN apk add --no-cache postgresql-client ca-certificates tzdata && update-ca-certificates

# Install production deps
COPY backend/package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]