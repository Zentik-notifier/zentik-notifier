# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
COPY frontend/dist ./public
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache postgresql-client ca-certificates tzdata && update-ca-certificates

# Install production deps
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy the built app to a template directory
COPY --from=builder /app /app-template

# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]