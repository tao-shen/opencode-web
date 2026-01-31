# OpenCode Web - Vercel Deployment

## Quick Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: OpenCode Web"
gh repo create opencode-web --public --source=. --push
```

### 2. Deploy to Vercel
Visit: https://vercel.com/new

1. Select your GitHub repository
2. Configure environment variables:
   - `REDIS_URL` - Upstash Redis URL
   - `OPENAI_API_KEY` - OpenAI API key
   - `ANTHROPIC_API_KEY` - Anthropic API key (optional)
   - `NEXT_PUBLIC_API_URL` - Your Vercel deployment URL

### 3. Database Setup (Upstash Redis)

```bash
# Create Upstash account and database
# Get your REDIS_URL from Upstash console
REDIS_URL=redis://username:password@host:port
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_URL` | Yes | Upstash Redis connection URL |
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT models |
| `ANTHROPIC_API_KEY` | No | Anthropic API key for Claude models |
| `NEXT_PUBLIC_API_URL` | No | API base URL (auto-detected in production) |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Vercel Edge/Serverless Functions               │
│  ├── /api/* - REST API endpoints                │
│  └── /api/sse/* - Server-Sent Events            │
├─────────────────────────────────────────────────┤
│  Next.js Frontend (React)                       │
│  ├── / - Main UI                                │
│  └── /session/[id] - Session view               │
├─────────────────────────────────────────────────┤
│  Upstash Redis                                  │
│  ├── Session storage                            │
│  ├── Message storage                            │
│  └── Event pub/sub                              │
└─────────────────────────────────────────────────┘
```

## API Endpoints

### Sessions
- `POST /api/session` - Create new session
- `GET /api/session` - List sessions
- `GET /api/session/:id` - Get session
- `DELETE /api/session/:id` - Delete session
- `POST /api/session/:id/prompt` - Submit prompt
- `POST /api/session/:id/abort` - Abort running
- `POST /api/session/:id/fork` - Fork session

### Real-time
- `GET /api/sse/session/:id` - SSE event stream

### Configuration
- `GET /api/config` - Get available providers/models
- `GET /api/tool` - List available tools

## Production Considerations

1. **Redis Connection**: Use Upstash for serverless-compatible Redis
2. **SSE Limitations**: Vercel has execution time limits; consider using:
   - Vercel Edge Functions for SSE
   - Third-party service like Pusher for extended connections
3. **AI API Costs**: Monitor usage and implement rate limiting
4. **Security**: Add authentication (e.g., Clerk, Auth.js)
5. **File Storage**: For persistent file storage, consider:
   - Vercel Blob
   - AWS S3
   - Cloudflare R2
