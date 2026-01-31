# OpenCode Web + Server 部署指南

这是一个完整的 OpenCode 部署方案，包含：
- **OpenCode Server** - 运行在 Oracle Cloud (永久免费)
- **Web 前端** - 运行在 Vercel (免费)

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│              Oracle Cloud (永久免费 VM)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OpenCode Server (Docker 容器)                      │   │
│  │  • 端口: 4096                                       │   │
│  │  • PTY 终端会话                                     │   │
│  │  • 工具执行 (read/write/edit/bash)                  │   │
│  │  • AI Provider 集成                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  访问地址: http://<VM-IP>:4096                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket + REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (免费)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OpenCode Web UI                                    │   │
│  │  • 终端风格界面                                     │   │
│  │  • 连接到您的 OpenCode Server                       │   │
│  │  • 支持 ?server= 参数指定服务地址                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 第一步: 部署 OpenCode Server (Oracle Cloud)

在 Oracle Cloud 控制台打开 **Cloud Shell**，执行：

```bash
# 方法1: 直接执行
curl -sL https://raw.githubusercontent.com/taoshen2000/opencode-web/main/deploy-opencode.sh -o deploy-opencode.sh
bash deploy-opencode.sh

# 或者方法2: 克隆仓库后执行
git clone https://github.com/taoshen2000/opencode-web.git
cd opencode-web
bash deploy-opencode.sh
```

### 部署成功后：
- 访问地址: `http://<您的VM-IP>:4096`
- 查看日志: `docker logs -f opencode`
- 重启服务: `docker compose restart`

---

## 第二步: 部署 Web 前端 (Vercel)

### 1. 推送代码到 GitHub

```bash
cd opencode-web
git init
git add .
git commit -m "Update: Connect to external OpenCode server"
gh repo create opencode-web --public --source=. --push
```

### 2. 部署到 Vercel

1. 访问: https://vercel.com/new
2. 选择刚才创建的 GitHub 仓库
3. 不需要配置环境变量（前端会自动连接）
4. 点击 **Deploy**

### 3. 访问 Web 界面

部署完成后，访问 Vercel 提供的 URL，然后：

```
# 连接到您的 OpenCode Server:
https://your-vercel-app.vercel.app/?server=http://your-vm-ip:4096

# 或者在 Vercel 环境变量中设置:
NEXT_PUBLIC_OPENCODE_URL=http://your-vm-ip:4096
```

---

## 使用说明

### 1. 直接访问 OpenCode 终端
```
http://<VM-IP>:4096
```
- 完整的终端界面
- 所有 OpenCode 功能可用

### 2. 通过 Web 前端访问
```
https://<Vercel-URL>
```
- 更友好的 Web 界面
- 需要在 URL 中指定服务器地址

---

## 故障排除

### OpenCode Server 无法启动?
```bash
# 检查 Docker 状态
docker ps -a

# 查看错误日志
docker logs opencode

# 重启服务
docker compose restart
```

### Web 前端无法连接?
1. 检查 OpenCode Server 是否运行: `curl http://<VM-IP>:4096/global/health`
2. 确保 Oracle Cloud 安全组已开放端口 4096
3. 在 URL 中添加 server 参数: `https://...?server=http://<VM-IP>:4096`

### 端口未开放?
在 Oracle Cloud 控制台:
```
Networking → Virtual Cloud Networks → <您的VNC>
→ Security Lists → Default Security List
→ Add Ingress Rules:
  - Source CIDR: 0.0.0.0/0
  - Destination Port: 4096
  - Protocol: TCP
```

---

## 环境变量 (可选)

如果使用 OpenAI/Anthropic API，在 OpenCode 终端中配置:

```bash
# 在 OpenCode 终端中
/config set provider.openai.apiKey sk-xxxxx
/config set provider.anthropic.apiKey sk-ant-xxxxx
```

---

## 资源

- OpenCode 官方仓库: https://github.com/anomalyco/opencode
- 项目仓库: https://github.com/taoshen2000/opencode-web
