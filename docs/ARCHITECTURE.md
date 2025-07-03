# VibeStudio Architecture

## Overview

VibeStudio is a modern web-based IDE that combines the power of VS Code with AI integration and real-time collaboration. The architecture follows a microservices approach with a React frontend and Node.js backend.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Services   │
│   (React +TS)   │◄──►│   (Node.js)     │◄──►│   (OpenAI/etc)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │   File System   │             │
         └──────────────►│   Git Repos     │◄────────────┘
                        └─────────────────┘
```

## Frontend Architecture

### Core Technologies
- **React 18**: UI framework with hooks and concurrent features
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: VS Code editor in the browser
- **Zustand**: Lightweight state management

### Component Structure
```
src/
├── core/           # VS Code-like functionality
│   ├── editor/      # Monaco editor integration
│   ├── explorer/    # File explorer
│   ├── terminal/    # Terminal integration
│   └── workbench/   # Main workbench layout
├── ui/             # Windsurf-inspired UI components
│   ├── panels/      # Bottom panels
│   ├── sidebar/     # Left sidebar
│   ├── statusbar/   # Bottom status bar
│   └── themes/      # Theme system
├── ai/             # AI integration
│   ├── chat/        # Chat interface
│   └── providers/   # AI service providers
└── shared/         # Shared utilities
    ├── components/  # Reusable components
    ├── hooks/       # Custom hooks
    ├── services/    # API services
    ├── types/       # TypeScript types
    └── utils/       # Utility functions
```

### State Management
- **Zustand**: Global application state
- **React Context**: Theme and user preferences
- **Local State**: Component-specific state
- **React Query**: Server state management (planned)

## Backend Architecture

### Core Technologies
- **Node.js**: Runtime environment
- **Express**: Web framework
- **TypeScript**: Type safety
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling

### API Structure
```
server/
├── routes/         # API route handlers
│   ├── api.js       # Core API routes
│   ├── files.js     # File system operations
│   ├── git.js       # Git integration
│   └── ai.js        # AI services
├── middleware/     # Custom middleware
├── services/       # Business logic
└── config/         # Configuration
```

### Security Features
- Input validation with express-validator
- Path sanitization for file operations
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with Helmet
- Error handling and logging

## Data Flow

### File Operations
1. User action in file explorer
2. Frontend sends API request
3. Backend validates request
4. File system operation performed
5. Response sent to frontend
6. UI updated with new state

### Git Operations
1. User performs git action
2. Frontend validates action
3. API request to backend
4. Git command executed
5. Result parsed and returned
6. UI reflects git state changes

### AI Integration
1. User requests AI assistance
2. Context gathered from editor
3. Request sent to AI service
4. AI processes request
5. Response formatted and returned
6. Result displayed in chat/editor

## Performance Considerations

### Frontend Optimization
- Code splitting for route-based chunks
- Lazy loading for heavy components
- Monaco editor loaded asynchronously
- Virtual scrolling for large file lists
- Debounced search and autocomplete

### Backend Optimization
- Compression middleware
- Caching for frequently accessed files
- Rate limiting to prevent overload
- Async operations for file I/O
- Connection pooling (when using databases)

## Security Architecture

### Frontend Security
- XSS protection through React's built-in escaping
- Content Security Policy headers
- Secure communication with HTTPS
- Input validation on forms

### Backend Security
- Helmet for security headers
- Input validation and sanitization
- Path traversal prevention
- Rate limiting
- CORS configuration
- Error message sanitization

## Deployment Architecture

### Development
```
Localhost:3000 (Frontend) ◄──► Localhost:3001 (Backend)
```

### Production
```
CDN (Static Assets) ◄─┐
                      │
Load Balancer ◄──────►├─ Frontend Servers
                      │
API Gateway ◄─────────└─ Backend Servers ◄──► Databases
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer for multiple instances
- CDN for static asset delivery
- Database read replicas

### Vertical Scaling
- Memory optimization
- CPU-intensive tasks moved to workers
- Caching layers
- Database indexing

## CLI Tool Architecture

### Command Structure
```
cli/
└── vibestudio.js    # Main CLI entry point
    ├── dev          # Development commands
    ├── build        # Build commands
    ├── test         # Testing commands
    ├── services     # Service management
    └── utils        # Utility commands
```

### Features
- Cross-platform compatibility
- Colored output and progress indicators
- Command validation and help system
- Integration with yarn/npm scripts
- Error handling and recovery

## Development Workflow

### Local Development
1. Run `yarn dev` or `vibestudio dev` to start both frontend and backend
2. Frontend proxies API requests to backend
3. Hot reload for both frontend and backend
4. Shared development database

### CI/CD Pipeline
1. Code pushed to repository
2. Automated tests run
3. Build process executed
4. Security scanning performed
5. Deployment to staging/production

## Future Enhancements

### Planned Features
- Real-time collaboration with WebRTC
- Plugin system for extensions
- Cloud synchronization
- Advanced AI code generation
- Integrated debugging tools

### Technical Improvements
- WebAssembly for performance-critical features
- Service worker for offline capabilities
- GraphQL API (alternative to REST)
- Microservices architecture
- Container orchestration

## Core Principles

### 1. Feature-First Organization
- Each major feature gets its own directory
- Related components stay together
- Clear separation of concerns

### 2. VS Code Foundation
- Monaco editor for code editing
- File explorer functionality
- Integrated terminal
- Workbench layout system

### 3. Windsurf-Inspired UI
- Clean, modern panels
- Sleek sidebar design
- Minimalist status bar
- Bright, accessible themes

### 4. AI Integration Ready
- MCP server architecture
- Simple chat foundation
- Extensible provider system