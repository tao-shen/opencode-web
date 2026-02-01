#!/bin/bash
# Restart script for OpenCode server
# Run this on the Oracle Cloud VM

set -e

echo "🔄 Restarting OpenCode server..."

# Stop existing container
docker stop opencode 2>/dev/null || true
docker rm opencode 2>/dev/null || true

# Clear memory
echo "🧹 Clearing memory cache..."
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null || true

# Start fresh container with memory limits
echo "🚀 Starting OpenCode container with memory limits..."
docker run -d \
  --name opencode \
  --restart unless-stopped \
  --memory="512m" \
  --memory-swap="1g" \
  -p 4096:4096 \
  -v /home/ubuntu/opencode-data:/workspace \
  ghcr.io/anomalyco/opencode:latest

# Wait for startup
echo "⏳ Waiting for OpenCode to start..."
sleep 10

# Check health
echo "🔍 Checking health..."
for i in {1..10}; do
  if curl -s http://localhost:4096/global/health > /dev/null 2>&1; then
    echo "✅ OpenCode is running!"
    docker logs opencode --tail 5
    exit 0
  fi
  echo "  Attempt $i/10..."
  sleep 5
done

echo "❌ OpenCode failed to start"
docker logs opencode --tail 20
exit 1
