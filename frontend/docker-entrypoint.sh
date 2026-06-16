#!/bin/sh
set -e

# Railway assigns a dynamic PORT; nginx must listen on it.
# Falls back to 80 for local Docker Compose (where PORT is not set).
LISTEN_PORT="${PORT:-80}"
sed -i "s/listen 80;/listen ${LISTEN_PORT};/" /etc/nginx/conf.d/default.conf

# Docker Compose: BACKEND_URL=http://backend:8000 → nginx proxies /api/ to the backend.
# Railway (standalone): BACKEND_URL not set → remove the proxy block so nginx doesn't
# crash trying to resolve an unknown hostname. The React app calls the backend directly
# via the VITE_API_URL that was baked in at build time.
if [ -n "${BACKEND_URL:-}" ]; then
    sed -i "s|http://backend:8000|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf
else
    awk '
        /# Proxy API calls/          { skip=1 }
        skip && /^[[:space:]]*\}$/   { skip=0; next }
        !skip                        { print }
    ' /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
    mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
