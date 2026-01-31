#!/bin/bash

# OpenCode 一键部署脚本 (Ubuntu/Debian)
# 在 Ubuntu 服务器上执行

set -e

echo "=========================================="
echo "  OpenCode 自动部署脚本 (Ubuntu)"
echo "=========================================="
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "开始部署 OpenCode..."
echo ""

# 1. 安装 Docker
log_info "步骤 1/5: 安装 Docker..."
if command -v docker &> /dev/null; then
    log_warn "Docker 已安装，跳过"
else
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker.io
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER
    log_info "Docker 安装完成"
fi
echo ""

# 2. 获取本机 IP
log_info "步骤 2/5: 获取本机 IP..."
VM_IP=$(hostname -I | awk '{print $1}')
log_info "VM IP 地址: $VM_IP"
echo ""

# 3. 克隆并部署 OpenCode
log_info "步骤 3/5: 部署 OpenCode..."

# 检查是否已存在
if [ -d "$HOME/opencode" ]; then
    log_warn "OpenCode 已存在，更新中..."
    cd $HOME/opencode
    git pull
else
    git clone https://github.com/anomalyco/opencode.git $HOME/opencode
    cd $HOME/opencode
fi
echo ""

# 4. 创建 Docker 配置
log_info "步骤 4/5: 创建 Docker 容器..."

cat > $HOME/opencode/docker-compose.yml << 'EOF'
version: '3.8'

services:
  opencode:
    image: ghcr.io/anomalyco/opencode:latest
    container_name: opencode
    ports:
      - "4096:4096"
    volumes:
      - opencode-data:/root/.local/share/opencode
      - opencode-projects:/projects
    environment:
      - OPENCODE_PORT=4096
      - OPENCODE_HOST=0.0.0.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4096/global/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  opencode-data:
  opencode-projects:

networks:
  default:
    name: opencode-network
EOF

# 停止旧容器
cd $HOME/opencode
docker compose down 2>/dev/null || true

# 拉取并启动新容器
docker compose pull
docker compose up -d

log_info "OpenCode 容器启动中..."
echo ""

# 5. 开放防火墙端口
log_info "步骤 5/5: 开放防火墙端口..."

# UFW
if command -v ufw &> /dev/null; then
    sudo ufw allow 4096/tcp 2>/dev/null || true
    log_info "UFW 端口 4096 已开放"
fi

# AWS/GCP 安全组需要手动在控制台配置
log_warn "如果使用 AWS/GCP/Oracle，请确保安全组已开放端口 4096"
echo ""

echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
log_info "访问地址: http://$VM_IP:4096"
log_info "Web UI:   http://$VM_IP:4096"
echo ""
log_info "查看日志: docker logs -f opencode"
log_info "停止服务: docker compose down"
log_info "重启服务: docker compose restart"
echo ""

# 检查健康状态
sleep 5
log_info "检查服务状态..."
if curl -s http://localhost:4096/global/health > /dev/null; then
    log_info "✅ OpenCode 运行正常！"
else
    log_warn "服务正在启动中，请稍后访问..."
    log_info "查看日志: docker logs -f opencode"
fi
