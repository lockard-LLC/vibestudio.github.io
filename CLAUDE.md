# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start full development environment (client + server)
- `npm run dev:client` - Start Vite dev server only (port 3000)
- `npm run dev:server` - Start Node.js server only (port 3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - ESLint with TypeScript rules
- `npm run format` - Prettier formatting
- `npm run type-check` - TypeScript compilation check (no emit)

### Testing
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode

### Utilities
- `npm run validate-env` - Validate environment setup
- `npm run setup` - Initial project setup

## Architecture Overview

VibeStudio is a modern web-based IDE combining VS Code functionality with Windsurf aesthetics. It's built with React + TypeScript frontend and Node.js backend.

### Key Components Structure
- **`src/core/`** - VS Code-like functionality (editor, explorer, terminal, workbench)
- **`src/ui/`** - Windsurf-inspired UI components (panels, sidebar, statusbar, themes)
- **`src/ai/`** - AI functionality foundation (chat interface, MCP providers)
- **`src/shared/`** - Common utilities, types, constants, hooks
- **`server/`** - Express backend with API routes and services
- **`mcp-servers/`** - Model Context Protocol integrations

### Main Layout System
The app follows a VS Code-like workbench pattern:
- ActivityBar (left side) for view switching
- Sidebar for active view content (explorer, search, etc.)
- EditorArea as main content region
- Panel (bottom) for terminal/output
- StatusBar for status info

### State Management
- Zustand for global state
- React hooks for local component state
- ThemeProvider context for theming

### Path Aliases (vite.config.ts)
- `@/` - src/
- `@/core` - src/core/
- `@/ui` - src/ui/
- `@/ai` - src/ai/
- `@/shared` - src/shared/

### Dependencies
- **Editor**: Monaco Editor with React wrapper
- **UI**: Tailwind CSS + Lucide React icons
- **Router**: React Router DOM
- **Utils**: clsx, tailwind-merge

### Server Architecture
Simple Express server with:
- CORS enabled for development
- API routes at `/api/*`
- Health check at `/health`
- Runs on port 3001 (configurable via PORT env)

## Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes  
- `refactor/description` - Code refactoring

## Testing Standards
- 80% minimum coverage target
- Unit tests for utilities in `src/shared/`
- Integration tests for components
- Use Vitest as test runner