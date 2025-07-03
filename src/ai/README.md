# AI Integration

Simple foundation for AI-powered features using MCP (Model Context Protocol).

## Current Features

### Chat (`/chat/`)
Basic AI chat interface:
- Message history
- Streaming responses
- Code syntax highlighting
- Copy/paste functionality

### Providers (`/providers/`)
MCP server connections:
- OpenAI integration
- Anthropic integration
- Local model support
- Provider switching

## Future Features

- Code completion
- Code review
- Refactoring suggestions
- Documentation generation
- Bug detection
- Performance optimization

## Architecture

```
Frontend (React) 
    ↓
Backend (Express)
    ↓  
MCP Servers
    ↓
AI Providers (OpenAI/Anthropic/Local)
```

## Implementation Notes

- Keep the initial implementation simple
- Focus on chat first, then expand
- Ensure all AI features are optional
- Respect user privacy and data
- Make switching providers easy
