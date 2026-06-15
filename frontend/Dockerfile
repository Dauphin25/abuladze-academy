# Frontend image: build the Vite app, then serve the static files with nginx.
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm ci

# Build the production bundle.
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine

# SPA routing + /api proxy to the backend service.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
