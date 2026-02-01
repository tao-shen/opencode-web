#!/bin/bash
set -e

CONTAINER_NAME="opencode"

echo "🔧 Fixing glibc for OpenCode PTY..."

docker exec $CONTAINER_NAME apk add --no-cache wget ca-certificates 2>/dev/null || true
docker exec $CONTAINER_NAME wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub || true
docker exec $CONTAINER_NAME wget -q -O /tmp/glibc.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-2.35-r1.apk || true
docker exec $CONTAINER_NAME wget -q -O /tmp/glibc-bin.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-bin-2.35-r1.apk || true
docker exec $CONTAINER_NAME wget -q -O /tmp/glibc-dev.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-dev-2.35-r1.apk || true
docker exec $CONTAINER_NAME apk add --force-overwrite --no-cache /tmp/glibc.apk /tmp/glibc-bin.apk /tmp/glibc-dev.apk 2>/dev/null || true
docker exec $CONTAINER_NAME rm -f /lib/ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2 /lib/libgcompat.so.0 /lib/libc.so.6 2>/dev/null || true

if docker exec $CONTAINER_NAME test -f /lib/ld-linux-x86-64.so.2; then
    echo "✅ glibc is properly installed"
else
    echo "⚠️ glibc not found, creating symlink..."
    docker exec $CONTAINER_NAME ln -s /usr/glibc/usr/lib/ld-linux-x86-64.so.2 /lib/ld-linux-x86-64.so.2 2>/dev/null || true
fi

echo "🔄 Restarting container..."
docker restart $CONTAINER_NAME
sleep 10

echo "🧪 Testing PTY creation..."
PTY_RESPONSE=$(docker exec $CONTAINER_NAME curl -s -X POST http://localhost:4096/pty -H "Content-Type: application/json" -d '{"title":"Test","cwd":"/"}' 2>&1)

if echo "$PTY_RESPONSE" | grep -q '"id":"pty_'; then
    echo "✅ PTY creation successful!"
    echo "PTY ID: $(echo $PTY_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ PTY creation failed"
    echo "$PTY_RESPONSE"
fi

echo "✅ Done!"
