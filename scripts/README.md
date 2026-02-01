# OpenCode Server Deployment

## Starting the Server

To start the OpenCode server with proper CORS configuration:

```bash
./scripts/start-opencode-server.sh
```

## Server Configuration

- **Port**: 4096
- **Hostname**: 0.0.0.0 (accessible from external networks)
- **CORS Origins**:
  - https://tacits-candy-shop.vercel.app
  - https://opencode-web-pearl.vercel.app

## Authentication (Optional)

To enable authentication, set environment variables before running:

```bash
export OPENCODE_SERVER_USERNAME=your-username
export OPENCODE_SERVER_PASSWORD=your-password
./scripts/start-opencode-server.sh
```

## Manual Start

You can also start the server manually:

```bash
opencode serve --port 4096 --hostname 0.0.0.0 \
  --cors https://tacits-candy-shop.vercel.app \
  --cors https://opencode-web-pearl.vercel.app
```

## Requirements

- OpenCode CLI must be installed: `npm install -g @opencode-ai/cli`
- Port 4096 must be available and not blocked by firewall

## Accessing the Server

Once running, the server will be accessible at:
- Local: http://localhost:4096
- External: http://your-server-ip:4096
- API Documentation: http://your-server-ip:4096/doc
