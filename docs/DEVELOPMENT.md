# VibeStudio Development Workflow

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Yarn 4.0+ (preferred) or npm 9+
- Git 2.30+
- Modern browser (Chrome 100+, Firefox 100+, Safari 15+)

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/vibestudio.git
cd vibestudio

# Install dependencies and setup
yarn install
yarn setup

# Start development environment
yarn dev
# OR use the CLI tool
npx vibestudio dev
```

### VibeStudio CLI Tool
We've built a custom CLI tool to streamline development:

```bash
# See all available commands
npx vibestudio --help

# Development commands
npx vibestudio dev          # Start full development environment
npx vibestudio dev --client-only  # Client only
npx vibestudio dev --server-only  # Server only

# Build commands
npx vibestudio build        # Production build
npx vibestudio build --analyze    # With bundle analysis

# Testing commands
npx vibestudio test         # Run tests
npx vibestudio test --watch # Watch mode
npx vibestudio test --coverage    # With coverage

# Code quality
npx vibestudio lint         # Check code quality
npx vibestudio lint --fix   # Auto-fix issues
npx vibestudio format       # Format code

# Utilities
npx vibestudio clean        # Clean build artifacts
npx vibestudio info         # Project information
npx vibestudio setup        # Re-run setup
```

## Branch Naming Convention
Follow structured Git branch naming:

- `feature/editor-monaco-integration`
- `feature/ai-chat-interface`
- `bugfix/file-explorer-scroll`
- `refactor/theme-system-cleanup`

## Commit Process
Step-by-step commits with logical breakpoints:

```bash
# 1. Stage related changes
git add src/core/editor/

# 2. Commit with descriptive message
git commit -m "feat(editor): add Monaco editor basic integration

- Initialize Monaco editor component
- Add TypeScript language support
- Implement basic theme switching
- Add resize handling"

# 3. Push and create PR
git push origin feature/editor-monaco-integration
```

## Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots/Evidence
[Attach screenshots or demo videos]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## Code Quality Standards

### Linting & Formatting
```bash
# Run before committing
npm run lint
npm run format
npm run type-check
```

### Testing Requirements
- 80% minimum coverage
- Unit tests for utilities
- Integration tests for components
- E2E tests for critical paths

### Performance Standards
- Lighthouse score 90+
- Bundle size monitoring
- Lazy loading for heavy components
- Optimize Monaco editor loading

## Development Scripts

### Using Yarn (Recommended)
```bash
yarn dev                 # Start development server
yarn build               # Production build
yarn preview             # Preview production build
yarn test                # Run tests
yarn test:watch          # Watch mode testing
yarn test:coverage       # Tests with coverage
yarn lint                # Lint code
yarn lint:fix            # Auto-fix lint issues
yarn format              # Format code
yarn type-check          # TypeScript checking
yarn clean               # Clean build artifacts
yarn setup               # Run setup script
yarn validate-env        # Validate environment
```

### Using VibeStudio CLI
```bash
vibestudio dev           # Start development
vibestudio build         # Build for production
vibestudio test          # Run tests
vibestudio lint          # Check code quality
vibestudio format        # Format code
vibestudio clean         # Clean artifacts
vibestudio info          # Show project info
```

## CI/CD Pipeline
Automated checks on every PR:
1. Linting and formatting
2. TypeScript compilation
3. Unit and integration tests
4. Build verification
5. Security scanning
6. Performance regression testing

## Backend API Integration

VibeStudio includes a robust backend API for:
- File system operations
- Git integration
- AI-powered code assistance
- Real-time collaboration

### API Endpoints
- `GET /health` - Health check
- `GET /api` - API information
- `/api/files/*` - File operations
- `/api/git/*` - Git operations  
- `/api/ai/*` - AI assistance

### Frontend-Backend Communication
The frontend communicates with the backend via:
- REST API calls
- WebSocket connections (for real-time features)
- Server-sent events (for notifications)

## Deployment Process

### Development
```bash
# Start development with both frontend and backend
yarn dev

# Or start individually
yarn dev:client  # Frontend only (port 3000)
yarn dev:server  # Backend only (port 3001)
```

### Production Build
```bash
# Build everything
yarn build

# Start production server
yarn start

# Or use CLI
vibestudio build
```

### Deployment
```bash
# Staging deployment
git push origin develop

# Production deployment  
git tag v1.0.0
git push origin v1.0.0

# Deploy using CLI
vibestudio build --analyze
```
