#!/bin/bash
set -e

echo "🚀 Deploying Ubuntu-based OpenCode image to Oracle Cloud..."

# Configuration
SSH_HOST="opencode-server"
CONTAINER_NAME="opencode"
IMAGE_NAME="opencode-ubuntu"
PORT=4096

echo "📦 Step 1: Copy Dockerfile to server..."
scp Dockerfile.ubuntu ${SSH_HOST}:/home/ubuntu/Dockerfile

echo "🏗️  Step 2: Build Docker image on server..."
ssh ${SSH_HOST} << 'EOF'
cd /home/ubuntu
echo "Building image..."
docker build -t opencode-ubuntu -f Dockerfile .
echo "✅ Build complete"
EOF

echo "🛑 Step 3: Stop existing container..."
ssh ${SSH_HOST} "docker stop ${CONTAINER_NAME} || true && docker rm ${CONTAINER_NAME} || true"

echo "🚀 Step 4: Start new container..."
ssh ${SSH_HOST} << EOF
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${PORT}:${PORT} \
  -v /home/ubuntu/opencode-data:/workspace \
  ${IMAGE_NAME}
EOF

echo "⏳ Step 5: Wait for container to start..."
sleep 5

echo "🔍 Step 6: Check container status..."
ssh ${SSH_HOST} "docker ps --filter name=${CONTAINER_NAME}"

echo "🧪 Step 7: Test health endpoint..."
ssh ${SSH_HOST} "curl -f http://localhost:${PORT}/global/health"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing PTY endpoint..."
ssh ${SSH_HOST} << 'EOF'
curl -X POST http://localhost:4096/pty \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","cwd":"/workspace"}'
EOF

echo ""
echo "🌐 Public PTY test via HTTPS:"
curl -X POST https://opencode.tao-shen.com/pty \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","cwd":"/workspace"}'

echo ""
echo "✅ All tests complete!"
