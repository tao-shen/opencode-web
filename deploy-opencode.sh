#!/bin/bash

# OpenCode 一键部署脚本
# 在 Oracle Cloud Cloud Shell 中执行

set -e

echo "=========================================="
echo "  OpenCode 自动部署脚本"
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

# 检查是否是 root 或 opc 用户
if [ "$USER" = "root" ]; then
    log_warn "检测到 root 用户，将自动切换到 opc 用户"
    NEW_USER="opc"
    if id "$NEW_USER" &>/dev/null; then
        exec su - $NEW_USER -c "bash $0"
    fi
fi

log_info "开始部署 OpenCode..."
echo ""

# 1. 安装 Docker
log_info "步骤 1/5: 安装 Docker..."
if command -v docker &> /dev/null; then
    log_warn "Docker 已安装，跳过"
else
    sudo dnf install -y docker
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
log_info "步骤 3/5: 克隆 OpenCode 仓库..."
if [ -d "/home/$USER/opencode" ]; then
    log_warn "OpenCode 已存在，更新中..."
    cd /home/$USER/opencode
    git pull
else
    git clone https://github.com/anomalyco/opencode.git /home/$USER/opencode
    cd /home/$USER/opencode
fi
echo ""

# 4. 创建 Docker 配置
log_info "步骤 4/5: 创建 Docker 容器..."

# 创建 docker-compose.yml
cat > /home/$USER/opencode/docker-compose.yml << 'EOF'
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
docker compose down 2>/dev/null || true

# 拉取并启动新容器
docker compose pull
docker compose up -d

log_info "OpenCode 容器启动中..."
echo ""

# 5. 配置防火墙
log_info "步骤 5/5: 配置防火墙..."

# Oracle Cloud 默认使用 Cloud-init 配置防火墙
# 检查是否需要手动开放端口
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=4096/tcp
    sudo firewall-cmd --reload
    log_info "firewalld 端口已开放"
elif command -v ufw &> /dev/null; then
    sudo ufw allow 4096/tcp
    log_info "UFW 端口已开放"
else
    log_warn "未检测到防火墙，请确保 Oracle Cloud 安全组已开放端口 4096"
fi

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
log_info "访问地址: http://$VM_IP:4096"
echo ""
log_info "查看日志: docker logs -f opencode"
log_info "停止服务: docker compose down"
log_info "重启服务: docker compose restart"
echo ""

# 等待几秒后检查健康状态
sleep 5
log_info "检查服务状态..."
if curl -s http://localhost:4096/global/health > /dev/null; then
    log_info "✅ OpenCode 运行正常！"
else
    log_warn "服务正在启动中，请稍后访问..."
    log_info "查看日志: docker logs -f opencode"
fi
