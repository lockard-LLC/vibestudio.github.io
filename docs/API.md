# VibeStudio API Documentation

## Overview

VibeStudio provides a comprehensive REST API for file management, git operations, and AI-powered code assistance. The API is built with Express.js and includes security features, rate limiting, and validation.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.vibestudio.online/api`

## Authentication

Currently, the API is open for development. In production, authentication will be required for most endpoints.

## Core Endpoints

### Health & Status

#### `GET /health`
Returns server health information.

**Response:**
```json
{
  "status": "healthy",
  "service": "VibeStudio API",
  "version": "0.1.0-beta",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "environment": "development"
}
```

#### `GET /api`
Returns API information and available endpoints.

#### `GET /api/status`
Returns service status for all components.

## File Operations

### `GET /api/files/ls`
List directory contents.

**Query Parameters:**
- `dir` (string): Directory path (default: ".")

**Response:**
```json
{
  "path": "./src",
  "items": [
    {
      "name": "App.tsx",
      "type": "file",
      "size": 2048,
      "modified": "2024-01-15T10:00:00Z",
      "path": "./src/App.tsx"
    }
  ]
}
```

### `GET /api/files/read/:path`
Read file content.

**Parameters:**
- `path` (string): File path

**Response:**
```json
{
  "path": "src/App.tsx",
  "content": "import React from 'react'...",
  "size": 2048,
  "modified": "2024-01-15T10:00:00Z",
  "encoding": "utf8"
}
```

### `POST /api/files/write/:path`
Write file content.

**Parameters:**
- `path` (string): File path

**Body:**
```json
{
  "content": "console.log('Hello World')",
  "encoding": "utf8"
}
```

### `POST /api/files/mkdir/:path`
Create directory.

### `DELETE /api/files/rm/:path`
Delete file or directory.

### `PUT /api/files/mv/:path`
Rename/move file or directory.

**Body:**
```json
{
  "newPath": "new/path/to/file.txt"
}
```

## Git Operations

### `GET /api/git/status`
Get git repository status.

**Response:**
```json
{
  "isRepo": true,
  "clean": false,
  "files": [
    {
      "path": "src/App.tsx",
      "status": { "index": "M", "workingTree": " " },
      "staged": true,
      "modified": false,
      "untracked": false
    }
  ],
  "branch": "main"
}
```

### `GET /api/git/branches`
List all branches.

### `GET /api/git/commits`
Get commit history.

**Query Parameters:**
- `limit` (number): Number of commits (default: 20)

### `POST /api/git/add`
Stage files for commit.

**Body:**
```json
{
  "files": ["src/App.tsx", "src/index.ts"]
}
```

### `POST /api/git/commit`
Create a commit.

**Body:**
```json
{
  "message": "Add new feature"
}
```

### `POST /api/git/push`
Push to remote repository.

**Body:**
```json
{
  "remote": "origin",
  "branch": "main"
}
```

### `POST /api/git/pull`
Pull from remote repository.

### `POST /api/git/checkout`
Switch branch.

**Body:**
```json
{
  "branch": "feature/new-feature"
}
```

## AI Integration

### `POST /api/ai/chat`
AI-powered chat assistance.

**Body:**
```json
{
  "message": "How do I create a React component?",
  "context": "Working on a TypeScript project",
  "mode": "code"
}
```

**Response:**
```json
{
  "response": "Here's how to create a React component...",
  "mode": "code",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "tokens": 150,
    "processingTime": "1.2s",
    "model": "vibestudio-mock-v1",
    "confidence": 0.95
  }
}
```

### `POST /api/ai/complete`
Code completion suggestions.

**Body:**
```json
{
  "code": "function hello(",
  "language": "javascript",
  "position": { "line": 5, "column": 15 }
}
```

### `POST /api/ai/analyze`
Code analysis and suggestions.

**Body:**
```json
{
  "code": "const x = 'hello'",
  "language": "javascript",
  "analysis_type": "performance"
}
```

### `GET /api/ai/status`
AI service status and capabilities.

## Rate Limiting

- **Development**: 1000 requests per 15 minutes
- **Production**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Request throttling
- **Input Validation**: Request validation
- **Path Sanitization**: Prevents directory traversal

## WebSocket Endpoints

### `/ws/files`
Real-time file system events.

### `/ws/git`
Real-time git operation updates.

### `/ws/collaboration`
Real-time collaboration features.

## SDK Usage

```javascript
import { VibeStudioAPI } from '@vibestudio/sdk'

const api = new VibeStudioAPI({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
})

// File operations
const files = await api.files.list('src/')
const content = await api.files.read('src/App.tsx')
await api.files.write('src/new-file.ts', 'console.log("Hello")')

// Git operations
const status = await api.git.status()
await api.git.add(['src/App.tsx'])
await api.git.commit('Update component')

// AI assistance
const response = await api.ai.chat('How to optimize this code?', {
  mode: 'optimize',
  context: 'React TypeScript project'
})
```