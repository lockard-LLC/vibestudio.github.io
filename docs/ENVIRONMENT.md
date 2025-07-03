# Environment Configuration

## Required Environment Variables

### Core Application
```env
# App Identity
VITE_APP_NAME=VibeStudio
VITE_APP_VERSION=0.1.0-beta
VITE_DOMAIN=vibestudio.online

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Development
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_DEVTOOLS=true
```

### AI Integration
```env
# MCP Configuration
MCP_SERVER_PORT=3002
MCP_SERVER_HOST=localhost

# AI Providers (choose one or multiple)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_AI_PROVIDER=openai

# AI Features
VITE_ENABLE_AI_CHAT=true
VITE_AI_MODEL=gpt-4
```

### File System & Storage
```env
# File Upload Limits
VITE_MAX_FILE_SIZE=10485760  # 10MB
VITE_MAX_FILES_PER_PROJECT=1000

# Storage (for future cloud features)
AWS_S3_BUCKET=vibestudio-projects
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
```

### Authentication (Future)
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h

# OAuth Providers
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
```

### Real-time Features
```env
# WebSocket Configuration
WEBSOCKET_PORT=3001
WEBSOCKET_ORIGINS=http://localhost:3000,https://vibestudio.online

# Redis (for scaling)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
```

### Development Tools
```env
# Performance Monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=your_sentry_dsn

# Analytics (Future)
VITE_ANALYTICS_ID=your_analytics_id
VITE_ENABLE_ANALYTICS=false
```

## Environment Files Structure
```
vibestudio/
├── .env.local          # Local development (gitignored)
├── .env.development     # Development defaults
├── .env.staging         # Staging environment
├── .env.production      # Production environment
└── .env.example         # Template for new developers
```

## Setup Instructions

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Fill in your values:
```bash
# Edit .env.local with your API keys and preferences
nano .env.local
```

3. Validate configuration:
```bash
npm run validate-env
```

## Security Notes
- Never commit real API keys to git
- Use different keys for different environments
- Rotate keys regularly
- Monitor API usage and costs
