# Frontend image: build the Vite app, then serve the static files with nginx.
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm ci

# Declare build arg so Railway passes VITE_API_URL into the Docker build context.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle.
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine

# SPA routing + optional /api proxy (see docker-entrypoint.sh).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
