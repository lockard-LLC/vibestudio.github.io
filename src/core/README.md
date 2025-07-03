# Core Components

VS Code-like core functionality that provides the foundation of the IDE.

## Structure

### Editor (`/editor/`)
Monaco editor integration with:
- Syntax highlighting
- IntelliSense 
- Multi-tab support
- Custom themes

### Explorer (`/explorer/`)
File tree component featuring:
- File/folder navigation
- Context menus
- Drag & drop
- Search functionality

### Terminal (`/terminal/`)
Integrated terminal with:
- Multiple terminal instances
- Shell integration
- Command history
- Terminal themes

### Workbench (`/workbench/`)
Main layout system including:
- Panel management
- Sidebar handling
- Status bar integration
- Window management

## Implementation Notes

All core components should:
- Follow VS Code UX patterns
- Be highly performant
- Support keyboard shortcuts
- Integrate with the theme system
