// src/core/terminal/TerminalManager.tsx
import React, { useState } from 'react'
import { Plus, X, Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react'
import { Terminal } from './Terminal'

interface TerminalTab {
  id: string
  title: string
  isActive: boolean
}

interface TerminalManagerProps {
  height: number
  onHeightChange: (height: number) => void
  onClose: () => void
}

export const TerminalManager: React.FC<TerminalManagerProps> = ({
  height,
  onHeightChange,
  onClose
}) => {
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: 'terminal-1', title: 'Terminal 1', isActive: true }
  ])
  const [activeTerminalId, setActiveTerminalId] = useState('terminal-1')
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    const startY = e.clientY
    const startHeight = height

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight - (e.clientY - startY)
      const clampedHeight = Math.max(100, Math.min(500, newHeight))
      onHeightChange(clampedHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const createNewTerminal = () => {
    const newId = `terminal-${Date.now()}`
    const newTerminal: TerminalTab = {
      id: newId,
      title: `Terminal ${terminals.length + 1}`,
      isActive: true
    }

    setTerminals(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTerminal))
    setActiveTerminalId(newId)
  }

  const closeTerminal = (terminalId: string) => {
    if (terminals.length <= 1) {
      onClose()
      return
    }

    const newTerminals = terminals.filter(t => t.id !== terminalId)
    setTerminals(newTerminals)

    if (activeTerminalId === terminalId && newTerminals.length > 0) {
      setActiveTerminalId(newTerminals[0].id)
    }
  }

  const switchToTerminal = (terminalId: string) => {
    setActiveTerminalId(terminalId)
    setTerminals(prev => prev.map(t => ({ ...t, isActive: t.id === terminalId })))
  }

  const maximizeTerminal = () => {
    onHeightChange(window.innerHeight * 0.6) // 60% of screen height
  }

  const minimizeTerminal = () => {
    onHeightChange(200) // Minimum height
  }

  return (
    <div 
      className="bg-primary border-t border-border flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Resize Handle */}
      <div
        className={`h-1 cursor-row-resize hover:bg-accent transition-colors ${
          isResizing ? 'bg-accent' : 'bg-transparent'
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* Terminal Header */}
      <div className="h-10 bg-secondary border-b border-border flex items-center justify-between px-4">
        {/* Terminal Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {terminals.map((terminal) => (
            <TerminalTabButton
              key={terminal.id}
              terminal={terminal}
              isActive={activeTerminalId === terminal.id}
              onSelect={() => switchToTerminal(terminal.id)}
              onClose={() => closeTerminal(terminal.id)}
            />
          ))}
          
          {/* New Terminal Button */}
          <button
            onClick={createNewTerminal}
            className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm hover:bg-primary/50 transition-colors"
            title="New Terminal"
          >
            <Plus size={14} className="text-text-secondary" />
            <span className="text-text-secondary">New</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={minimizeTerminal}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent/10 transition-colors"
            title="Minimize Terminal"
          >
            <Minimize2 size={14} className="text-text-secondary" />
          </button>
          
          <button
            onClick={maximizeTerminal}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent/10 transition-colors"
            title="Maximize Terminal"
          >
            <Maximize2 size={14} className="text-text-secondary" />
          </button>
          
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-error/20 transition-colors"
            title="Close Terminal Panel"
          >
            <X size={14} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 relative">
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            className={`absolute inset-0 ${
              activeTerminalId === terminal.id ? 'block' : 'hidden'
            }`}
          >
            <Terminal
              id={terminal.id}
              onOutput={(data) => console.log('Terminal output:', data)}
              onClose={() => closeTerminal(terminal.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

interface TerminalTabButtonProps {
  terminal: TerminalTab
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}

const TerminalTabButton: React.FC<TerminalTabButtonProps> = ({
  terminal,
  isActive,
  onSelect,
  onClose
}) => {
  return (
    <div
      className={`
        flex items-center px-3 py-1 rounded-md text-sm cursor-pointer
        transition-colors relative group
        ${isActive 
          ? 'bg-primary text-text-primary' 
          : 'text-text-secondary hover:text-text-primary hover:bg-primary/50'
        }
      `}
      onClick={onSelect}
    >
      <TerminalIcon size={14} className="mr-2" />
      <span>{terminal.title}</span>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className={`
          ml-2 w-4 h-4 flex items-center justify-center rounded hover:bg-error/20 
          transition-opacity
          ${isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-70'}
        `}
        title="Close Terminal"
      >
        <X size={10} />
      </button>
      
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
      )}
    </div>
  )
}