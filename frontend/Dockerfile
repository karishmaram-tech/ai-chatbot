# Static export build for Render/Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source
COPY . .

# Build static export
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Serve with nginx ──────────────────────────────────────
FROM nginx:alpine AS runtime

# Copy built static files
COPY --from=builder /app/out /usr/share/nginx/html

# Nginx config for SPA routing
RUN echo 'server {     listen 80;     root /usr/share/nginx/html;     index index.html;     location / { try_files $uri $uri/ $uri.html /index.html; }     location /health { return 200 "ok"; }     gzip on;     gzip_types text/plain text/css application/json application/javascript; }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3     CMD wget -q -O- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
