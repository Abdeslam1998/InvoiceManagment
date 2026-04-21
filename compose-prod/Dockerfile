# syntax=docker/dockerfile:1.7

############################
# Backend dependencies
############################
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

############################
# Backend runtime
############################
FROM node:20-alpine AS backend-runtime
WORKDIR /app/backend
ENV NODE_ENV=production
# Copy installed dependencies from deps stage
COPY --from=backend-deps /app/backend/node_modules ./node_modules
# Copy source code (excluding package files and dev files)
COPY backend/server.js ./
COPY backend/config ./config/
COPY backend/controllers ./controllers/
COPY backend/middleware ./middleware/
COPY backend/models ./models/
COPY backend/routes ./routes/
EXPOSE 3000
CMD ["node", "server.js"]
