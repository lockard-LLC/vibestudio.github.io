// src/core/terminal/Terminal.tsx
import React, { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { useTheme } from '../../shared/hooks/useTheme'
import 'xterm/css/xterm.css'

interface TerminalProps {
  id: string
  onOutput?: (data: string) => void
  onClose?: () => void
  initialCommand?: string
}

export const Terminal: React.FC<TerminalProps> = ({ 
  id: _, 
  onOutput, 
  onClose: __, 
  initialCommand 
}) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const { theme } = useTheme()
  const [isReady, setIsReady] = useState(false)

  // Terminal history and state
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentLine, setCurrentLine] = useState('')
  const [currentDirectory, setCurrentDirectory] = useState('~')

  useEffect(() => {
    if (!terminalRef.current) return

    // Create terminal instance
    const terminal = new XTerm({
      fontFamily: 'Fira Code, Consolas, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      rightClickSelectsWord: true,
      theme: getTerminalTheme(theme),
      allowProposedApi: true
    })

    // Create addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    // Load addons
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)

    // Store references
    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Open terminal
    terminal.open(terminalRef.current)
    fitAddon.fit()

    // Welcome message
    terminal.writeln('🚀 VibeStudio Terminal - Your Creative Code Space')
    terminal.writeln('💡 Type "help" for available commands\r\n')
    
    writePrompt(terminal)
    setIsReady(true)

    // Handle input
    terminal.onData((data) => {
      handleTerminalInput(terminal, data)
    })

    // Handle resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [theme])

  // Update theme when it changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = getTerminalTheme(theme)
    }
  }, [theme])

  // Execute initial command
  useEffect(() => {
    if (isReady && initialCommand && xtermRef.current) {
      executeCommand(xtermRef.current, initialCommand)
    }
  }, [isReady, initialCommand])

  const writePrompt = (terminal: XTerm) => {
    const prompt = `\x1b[32m➜\x1b[0m \x1b[36m${currentDirectory}\x1b[0m \x1b[90m$\x1b[0m `
    terminal.write(prompt)
  }

  const handleTerminalInput = (terminal: XTerm, data: string) => {
    const ord = data.charCodeAt(0)

    if (ord === 0x0d) { // Enter
      terminal.write('\r\n')
      if (currentLine.trim()) {
        executeCommand(terminal, currentLine.trim())
        setCommandHistory(prev => [...prev, currentLine.trim()])
        setHistoryIndex(-1)
      } else {
        writePrompt(terminal)
      }
      setCurrentLine('')
    } else if (ord === 0x7f) { // Backspace
      if (currentLine.length > 0) {
        setCurrentLine(prev => prev.slice(0, -1))
        terminal.write('\b \b')
      }
    } else if (ord === 0x1b) { // Escape sequences (arrows, etc.)
      const sequence = data.slice(1)
      if (sequence === '[A') { // Up arrow
        navigateHistory(terminal, 'up')
      } else if (sequence === '[B') { // Down arrow
        navigateHistory(terminal, 'down')
      } else if (sequence === '[C') { // Right arrow
        // Handle right arrow if needed
      } else if (sequence === '[D') { // Left arrow
        // Handle left arrow if needed
      }
    } else if (ord >= 32) { // Printable characters
      setCurrentLine(prev => prev + data)
      terminal.write(data)
    }
  }

  const navigateHistory = (terminal: XTerm, direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return

    let newIndex = historyIndex
    if (direction === 'up') {
      newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
    } else {
      newIndex = historyIndex === -1 ? -1 : Math.min(commandHistory.length - 1, historyIndex + 1)
    }

    setHistoryIndex(newIndex)
    
    // Clear current line
    terminal.write('\r\x1b[K')
    writePrompt(terminal)
    
    // Write command from history
    if (newIndex >= 0 && newIndex < commandHistory.length) {
      const command = commandHistory[newIndex]
      setCurrentLine(command)
      terminal.write(command)
    } else {
      setCurrentLine('')
    }
  }

  const executeCommand = (terminal: XTerm, command: string) => {
    const [cmd, ...args] = command.split(' ')
    
    switch (cmd.toLowerCase()) {
      case 'help':
        showHelp(terminal)
        break
      case 'clear':
        terminal.clear()
        break
      case 'echo':
        terminal.writeln(args.join(' '))
        break
      case 'pwd':
        terminal.writeln(currentDirectory)
        break
      case 'ls':
      case 'dir':
        listFiles(terminal)
        break
      case 'cd':
        changeDirectory(terminal, args[0] || '~')
        break
      case 'mkdir':
        makeDirectory(terminal, args[0])
        break
      case 'touch':
        createFile(terminal, args[0])
        break
      case 'cat':
        showFileContent(terminal, args[0])
        break
      case 'npm':
        handleNpmCommand(terminal, args)
        break
      case 'node':
        handleNodeCommand(terminal, args)
        break
      case 'git':
        handleGitCommand(terminal, args)
        break
      case 'vibestudio':
      case 'vibe':
        showVibeStudioInfo(terminal)
        break
      default:
        terminal.writeln(`\x1b[31mCommand not found: ${cmd}\x1b[0m`)
        terminal.writeln(`Type 'help' for available commands`)
    }
    
    writePrompt(terminal)
    
    if (onOutput) {
      onOutput(`${command}\n`)
    }
  }

  const showHelp = (terminal: XTerm) => {
    const helpText = [
      '',
      '\x1b[36m🚀 VibeStudio Terminal Commands\x1b[0m',
      '',
      '\x1b[33mFile Operations:\x1b[0m',
      '  ls, dir          List files and directories',
      '  pwd              Show current directory',
      '  cd <path>        Change directory',
      '  mkdir <name>     Create directory',
      '  touch <name>     Create file',
      '  cat <file>       Show file content',
      '',
      '\x1b[33mDevelopment:\x1b[0m',
      '  npm <command>    NPM package manager',
      '  node <file>      Run Node.js file',
      '  git <command>    Git version control',
      '',
      '\x1b[33mTerminal:\x1b[0m',
      '  clear            Clear terminal',
      '  help             Show this help',
      '  echo <text>      Print text',
      '',
      '\x1b[33mVibeStudio:\x1b[0m',
      '  vibe, vibestudio Show VibeStudio info',
      '',
      '\x1b[90mUse ↑/↓ arrows for command history\x1b[0m',
      ''
    ]
    
    helpText.forEach(line => terminal.writeln(line))
  }

  const listFiles = (terminal: XTerm) => {
    // Mock file listing - in a real implementation, this would interface with your file system
    const files = [
      { name: 'src/', type: 'dir', size: '-' },
      { name: 'public/', type: 'dir', size: '-' },
      { name: 'package.json', type: 'file', size: '2.1KB' },
      { name: 'README.md', type: 'file', size: '1.5KB' },
      { name: 'tsconfig.json', type: 'file', size: '0.8KB' }
    ]
    
    terminal.writeln('')
    files.forEach(file => {
      const color = file.type === 'dir' ? '\x1b[34m' : '\x1b[0m'
      const icon = file.type === 'dir' ? '📁' : '📄'
      terminal.writeln(`${icon} ${color}${file.name.padEnd(20)}\x1b[0m ${file.size}`)
    })
    terminal.writeln('')
  }

  const changeDirectory = (terminal: XTerm, path: string) => {
    if (path === '~' || path === '/') {
      setCurrentDirectory('~')
      terminal.writeln(`Changed to ${path}`)
    } else if (path === '..') {
      const parts = currentDirectory.split('/').filter(p => p)
      if (parts.length > 0) {
        parts.pop()
        const newPath = parts.length > 0 ? '/' + parts.join('/') : '~'
        setCurrentDirectory(newPath)
        terminal.writeln(`Changed to ${newPath}`)
      }
    } else {
      const newPath = currentDirectory === '~' ? path : `${currentDirectory}/${path}`
      setCurrentDirectory(newPath)
      terminal.writeln(`Changed to ${newPath}`)
    }
  }

  const makeDirectory = (terminal: XTerm, name: string) => {
    if (!name) {
      terminal.writeln('\x1b[31mError: Directory name required\x1b[0m')
      return
    }
    terminal.writeln(`\x1b[32mCreated directory: ${name}\x1b[0m`)
  }

  const createFile = (terminal: XTerm, name: string) => {
    if (!name) {
      terminal.writeln('\x1b[31mError: File name required\x1b[0m')
      return
    }
    terminal.writeln(`\x1b[32mCreated file: ${name}\x1b[0m`)
  }

  const showFileContent = (terminal: XTerm, filename: string) => {
    if (!filename) {
      terminal.writeln('\x1b[31mError: File name required\x1b[0m')
      return
    }
    
    // Mock file content
    const mockContent = `// ${filename}
console.log("Hello from VibeStudio!")
// Your Creative Code Space`
    
    terminal.writeln('')
    terminal.writeln(`\x1b[36m--- ${filename} ---\x1b[0m`)
    terminal.writeln(mockContent)
    terminal.writeln('')
  }

  const handleNpmCommand = (terminal: XTerm, args: string[]) => {
    const subcommand = args[0] || 'help'
    terminal.writeln(`\x1b[36mNPM ${subcommand}\x1b[0m`)
    
    switch (subcommand) {
      case 'install':
      case 'i':
        terminal.writeln('📦 Installing packages...')
        terminal.writeln('\x1b[32m✓ Packages installed successfully\x1b[0m')
        break
      case 'run':
        terminal.writeln(`🚀 Running script: ${args[1] || 'dev'}`)
        break
      case 'version':
      case 'v':
        terminal.writeln('npm: 9.0.0')
        terminal.writeln('node: 18.0.0')
        break
      default:
        terminal.writeln('Available commands: install, run, version')
    }
  }

  const handleNodeCommand = (terminal: XTerm, args: string[]) => {
    const filename = args[0]
    if (!filename) {
      terminal.writeln('\x1b[31mError: File name required\x1b[0m')
      return
    }
    terminal.writeln(`\x1b[36mRunning: node ${filename}\x1b[0m`)
    terminal.writeln('Hello from VibeStudio!')
  }

  const handleGitCommand = (terminal: XTerm, args: string[]) => {
    const subcommand = args[0] || 'status'
    terminal.writeln(`\x1b[36mGit ${subcommand}\x1b[0m`)
    
    switch (subcommand) {
      case 'status':
        terminal.writeln('On branch main')
        terminal.writeln('Your branch is up to date.')
        terminal.writeln('')
        terminal.writeln('nothing to commit, working tree clean')
        break
      case 'log':
        terminal.writeln('commit abc123 (HEAD -> main)')
        terminal.writeln('Author: VibeStudio User')
        terminal.writeln('Date: ' + new Date().toLocaleDateString())
        terminal.writeln('')
        terminal.writeln('    Initial commit from VibeStudio')
        break
      default:
        terminal.writeln('Available commands: status, log, add, commit, push, pull')
    }
  }

  const showVibeStudioInfo = (terminal: XTerm) => {
    terminal.writeln('')
    terminal.writeln('\x1b[36m🚀 VibeStudio - Your Creative Code Space\x1b[0m')
    terminal.writeln('')
    terminal.writeln('\x1b[33mVersion:\x1b[0m 0.1.0-beta')
    terminal.writeln('\x1b[33mTaglines:\x1b[0m')
    terminal.writeln('  • Code with Vibe')
    terminal.writeln('  • Where Code Meets Flow')
    terminal.writeln('  • Your Creative Code Space')
    terminal.writeln('')
    terminal.writeln('\x1b[33mFeatures:\x1b[0m')
    terminal.writeln('  ✓ Monaco Editor with IntelliSense')
    terminal.writeln('  ✓ File System Integration')
    terminal.writeln('  ✓ Integrated Terminal')
    terminal.writeln('  ✓ Light/Dark Theme')
    terminal.writeln('  ✓ AI Chat (coming soon)')
    terminal.writeln('')
    terminal.writeln('\x1b[90mBuilt with React, TypeScript, and Vite\x1b[0m')
    terminal.writeln('')
  }

  return (
    <div className="h-full bg-primary">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  )
}

const getTerminalTheme = (theme: string) => {
  if (theme === 'dark') {
    return {
      background: '#1A1A1A',
      foreground: '#FFFFFF',
      cursor: '#64B5F6',
      cursorAccent: '#1A1A1A',
      selection: '#64B5F6',
      black: '#000000',
      red: '#EF5350',
      green: '#66BB6A',
      yellow: '#FFB74D',
      blue: '#64B5F6',
      magenta: '#BA68C8',
      cyan: '#4DD0E1',
      white: '#FFFFFF',
      brightBlack: '#555555',
      brightRed: '#FF5252',
      brightGreen: '#69F0AE',
      brightYellow: '#FFD740',
      brightBlue: '#40C4FF',
      brightMagenta: '#EA80FC',
      brightCyan: '#18FFFF',
      brightWhite: '#FFFFFF'
    }
  } else {
    return {
      background: '#FFFFFF',
      foreground: '#000000',
      cursor: '#2196F3',
      cursorAccent: '#FFFFFF',
      selection: '#E3F2FD',
      black: '#000000',
      red: '#F44336',
      green: '#4CAF50',
      yellow: '#FF9800',
      blue: '#2196F3',
      magenta: '#9C27B0',
      cyan: '#00BCD4',
      white: '#FFFFFF',
      brightBlack: '#555555',
      brightRed: '#F44336',
      brightGreen: '#4CAF50',
      brightYellow: '#FF9800',
      brightBlue: '#2196F3',
      brightMagenta: '#9C27B0',
      brightCyan: '#00BCD4',
      brightWhite: '#FFFFFF'
    }
  }
}