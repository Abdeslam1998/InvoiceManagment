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
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ .
EXPOSE 3000
CMD ["node", "server.js"]

############################
# Frontend build
############################
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY angular.json ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build -- --configuration production

############################
# Frontend runtime (Nginx)
############################
FROM nginx:1.27-alpine AS frontend-runtime
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist/pristine-flow/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
