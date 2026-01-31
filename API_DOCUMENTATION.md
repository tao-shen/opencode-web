# OpenCode API Gateway & Documentation

## 概述 | Overview

This is an API Gateway for OpenCode that provides:
- API proxy to OpenCode server
- Documentation in Chinese and English
- Interactive API explorer

## 部署 | Deployment

### Vercel 部署
```bash
# 1. 设置环境变量
export OPENCODE_SERVER_URL=http://170.9.12.37:4096

# 2. 部署到 Vercel
npx vercel --prod
```

### 环境变量
| 变量名 | 必填 | 描述 |
|--------|------|------|
| `OPENCODE_SERVER_URL` | 是 | OpenCode 服务器地址 |

## API 端点 | API Endpoints

### 会话 | Sessions

#### 创建会话 | Create Session
```http
POST /api/session
Content-Type: application/json

{
  "title": "会话标题",
  "directory": "/path/to/project",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-4o"
  }
}
```

#### 获取会话列表 | List Sessions
```http
GET /api/session?projectID=default&limit=20
```

#### 获取会话详情 | Get Session
```http
GET /api/session/:id
```

#### 发送提示 | Submit Prompt
```http
POST /api/session/:id/prompt
Content-Type: application/json

{
  "message": "请帮我写一个 Python 函数",
  "agent": "general",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-4o"
  }
}
```

#### 获取消息 | Get Messages
```http
GET /api/session/:id/messages
```

#### 中断会话 | Abort Session
```http
POST /api/session/:id/abort
```

#### 分支会话 | Fork Session
```http
POST /api/session/:id/fork
Content-Type: application/json

{
  "title": "新会话标题"
}
```

#### 删除会话 | Delete Session
```http
DELETE /api/session/:id
```

### 全局 | Global

#### 健康检查 | Health Check
```http
GET /api/global/health
```

#### SSE 事件流 | Server-Sent Events
```http
GET /api/sse/session/:id
```

### 配置 | Configuration

#### 获取配置 | Get Config
```http
GET /api/config
```

#### 获取工具列表 | Get Tools
```http
GET /api/tool
```

## 响应格式 | Response Format

### 成功响应 | Success Response
```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应 | Error Response
```json
{
  "success": false,
  "error": "错误信息"
}
```

## WebSocket 连接 | WebSocket Connection

### PTY 连接 | PTY Connection
```http
WS /api/pty/:id/connect
```

## 示例代码 | Code Examples

### cURL 示例
```bash
# 创建会话
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"title":"My Session"}'

# 发送消息
curl -X POST http://localhost:3000/api/session/:id/prompt \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!","model":{"providerID":"openai","modelID":"gpt-4o"}}'
```

### JavaScript 示例
```javascript
// 创建会话
const response = await fetch('/api/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'My Session' })
});
const data = await response.json();

// 发送消息
const response = await fetch('/api/session/' + sessionId + '/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '请帮我写一个函数',
    model: { providerID: 'openai', modelID: 'gpt-4o' }
  })
});
```

### Python 示例
```python
import requests

# 创建会话
response = requests.post('/api/session', json={'title': 'My Session'})
data = response.json()

# 发送消息
response = requests.post(f'/api/session/{session_id}/prompt', json={
    'message': '请帮我写一个函数',
    'model': {'providerID': 'openai', 'modelID': 'gpt-4o'}
})
```

## 可用工具 | Available Tools

| 工具名 | 描述 | 示例 |
|--------|------|------|
| `read` | 读取文件内容 | `read /path/to/file` |
| `write` | 写入文件内容 | `write /path/to/file "content"` |
| `edit` | 编辑文件 | `edit /path/to/file old new` |
| `bash` | 执行 Shell 命令 | `bash ls -la` |
| `search` | 搜索文件内容 | `search pattern /path` |
| `lsp` | LSP 查询 | `lsp "query"` |
| `format` | 格式化代码 | `format /path/to/file` |

## 可用模型 | Available Models

### OpenAI
- `gpt-4o` - 最新旗舰模型
- `gpt-4-turbo` - 快速旗舰模型
- `gpt-3.5-turbo` - 经济实惠模型

### Anthropic
- `claude-sonnet-4-20250506` - Claude 4 Sonnet
- `claude-opus-4-20250506` - Claude 4 Opus

## 实时事件 | Real-time Events

### SSE 事件类型
| 事件类型 | 描述 |
|----------|------|
| `session.created` | 会话创建 |
| `session.status` | 会话状态变更 |
| `message.created` | 消息创建 |
| `message.part.updated` | 消息部分更新 |
| `tool.execute.before` | 工具执行前 |
| `tool.execute.after` | 工具执行后 |
| `permission.asked` | 权限请求 |

## 故障排除 | Troubleshooting

### 连接失败
1. 检查 OpenCode 服务器是否运行
2. 验证 `OPENCODE_SERVER_URL` 环境变量
3. 检查防火墙是否开放端口

### API 返回错误
1. 查看服务器日志: `docker logs opencode`
2. 检查请求格式是否正确
3. 验证认证信息（如果需要）

### SSE 连接断开
1. 重连机制应该自动处理
2. 手动重新连接 SSE 端点
3. 检查网络连接

## 资源 | Resources

- **OpenCode 官方仓库**: https://github.com/anomalyco/opencode
- **API 文档**: http://170.9.12.37:4096
- **项目仓库**: https://github.com/tao-shen/opencode-web
