// src/ui/panels/Panel.tsx (Updated with Terminal Integration)
import React, { useState } from 'react'
import { Terminal, X, Maximize2, FileText, AlertCircle, Play } from 'lucide-react'
import { TerminalManager } from '../../core/terminal/TerminalManager'

interface PanelProps {
  height: number
  onHeightChange: (height: number) => void
  onClose: () => void
}

export const Panel: React.FC<PanelProps> = ({ height, onHeightChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('terminal')
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

  const tabs = [
    { 
      id: 'terminal', 
      label: 'Terminal', 
      icon: Terminal,
      description: 'Integrated terminal with command support'
    },
    { 
      id: 'output', 
      label: 'Output', 
      icon: FileText,
      description: 'Build output and console logs'
    },
    { 
      id: 'problems', 
      label: 'Problems', 
      icon: AlertCircle,
      description: 'Errors, warnings, and diagnostics'
    },
    { 
      id: 'debug', 
      label: 'Debug Console', 
      icon: Play,
      description: 'Debug output and REPL'
    }
  ]

  return (
    <div 
      className="bg-primary border-t border-border flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Only show resize handle if not using terminal's own resize */}
      {activeTab !== 'terminal' && (
        <div
          className={`h-1 cursor-row-resize hover:bg-accent transition-colors ${
            isResizing ? 'bg-accent' : 'bg-transparent'
          }`}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Panel Header */}
      <div className="h-10 bg-secondary border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-1 rounded-md text-sm
                  transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-primary text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-primary/50'
                  }
                `}
                title={tab.description}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Panel Actions */}
        <div className="flex items-center space-x-2">
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent/10 transition-colors"
            title="Maximize Panel"
            onClick={() => onHeightChange(window.innerHeight * 0.6)}
          >
            <Maximize2 size={14} className="text-text-secondary" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-error/20 transition-colors"
            title="Close Panel"
          >
            <X size={14} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' && (
          <TerminalManager
            height={height - 40} // Subtract header height
            onHeightChange={onHeightChange}
            onClose={onClose}
          />
        )}
        {activeTab === 'output' && <OutputView />}
        {activeTab === 'problems' && <ProblemsView />}
        {activeTab === 'debug' && <DebugView />}
      </div>
    </div>
  )
}

const OutputView: React.FC = () => {
  const [outputLog, setOutputLog] = useState([
    { time: '14:32:01', level: 'info', message: 'VibeStudio development server started' },
    { time: '14:32:01', level: 'info', message: 'Local: http://localhost:3000' },
    { time: '14:32:01', level: 'info', message: 'Network: use --host to expose' },
    { time: '14:32:15', level: 'success', message: 'Build completed successfully' },
    { time: '14:32:16', level: 'info', message: 'Watching for file changes...' }
  ])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-error'
      case 'warning': return 'text-warning'
      case 'success': return 'text-success'
      case 'info': return 'text-info'
      default: return 'text-text-secondary'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '•'
    }
  }

  return (
    <div className="h-full bg-primary p-4 font-mono text-sm overflow-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-primary">Build Output</h3>
          <button
            onClick={() => setOutputLog([])}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        {outputLog.map((log, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="text-text-muted text-xs w-16 flex-shrink-0">{log.time}</span>
            <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
            <span className={`text-xs ${getLevelColor(log.level)}`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
      
      {outputLog.length === 0 && (
        <div className="text-center text-text-muted py-8">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p>No output yet</p>
          <p className="text-xs mt-1">Build logs and console output will appear here</p>
        </div>
      )}
    </div>
  )
}

const ProblemsView: React.FC = () => {
  const [problems, setProblems] = useState([
    {
      type: 'error',
      file: 'src/App.tsx',
      line: 42,
      column: 15,
      message: "Property 'foo' does not exist on type 'ComponentProps'",
      source: 'TypeScript'
    },
    {
      type: 'warning',
      file: 'src/utils/helpers.ts',
      line: 28,
      column: 8,
      message: 'Unused variable: tempValue',
      source: 'ESLint'
    },
    {
      type: 'info',
      file: 'src/components/Button.tsx',
      line: 15,
      column: 1,
      message: 'Consider adding accessibility attributes',
      source: 'A11y'
    }
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴'
      case 'warning': return '🟡'
      case 'info': return '🔵'
      default: return '⚪'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-error'
      case 'warning': return 'text-warning'
      case 'info': return 'text-info'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div className="h-full bg-primary overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-text-primary">Problems</span>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="text-error">🔴</span>
                <span className="text-text-secondary">
                  {problems.filter(p => p.type === 'error').length} errors
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-warning">🟡</span>
                <span className="text-text-secondary">
                  {problems.filter(p => p.type === 'warning').length} warnings
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-info">🔵</span>
                <span className="text-text-secondary">
                  {problems.filter(p => p.type === 'info').length} info
                </span>
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setProblems([])}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="border-t border-border">
        {problems.map((problem, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
          >
            <span className="flex-shrink-0 mt-0.5">{getTypeIcon(problem.type)}</span>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-sm font-medium ${getTypeColor(problem.type)}`}>
                  {problem.message}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-text-muted">
                <span className="font-mono">{problem.file}</span>
                <span>Line {problem.line}, Col {problem.column}</span>
                <span className="text-accent">{problem.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {problems.length === 0 && (
        <div className="text-center text-text-muted py-8">
          <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p>No problems detected</p>
          <p className="text-xs mt-1">Errors and warnings will appear here</p>
        </div>
      )}
    </div>
  )
}

const DebugView: React.FC = () => {
  const [debugLogs, setDebugLogs] = useState([
    { time: '14:32:45', message: 'Debug session started', type: 'system' },
    { time: '14:32:46', message: 'Breakpoint set at line 25', type: 'info' },
    { time: '14:32:47', message: 'console.log("Debug output from app")', type: 'log' }
  ])
  
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newLog = {
      time: new Date().toLocaleTimeString(),
      message: `> ${input}`,
      type: 'input'
    }
    
    setDebugLogs(prev => [...prev, newLog])
    
    // Mock evaluation
    setTimeout(() => {
      const result = {
        time: new Date().toLocaleTimeString(),
        message: `< ${input} // Evaluation result`,
        type: 'output'
      }
      setDebugLogs(prev => [...prev, result])
    }, 100)
    
    setInput('')
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'system': return 'text-accent'
      case 'info': return 'text-info'
      case 'log': return 'text-text-primary'
      case 'input': return 'text-warning'
      case 'output': return 'text-success'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div className="h-full bg-primary flex flex-col">
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">Debug Console</h3>
          <div className="text-xs text-text-muted">
            Interactive debugging and REPL environment
          </div>
        </div>
        
        <div className="space-y-1 mb-4">
          {debugLogs.map((log, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-text-muted text-xs w-16 flex-shrink-0">{log.time}</span>
              <span className={`text-xs ${getLogColor(log.type)}`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Evaluate JavaScript expression..."
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
          >
            Run
          </button>
        </form>
        <div className="text-xs text-text-muted mt-2">
          Press Enter to evaluate • Type JavaScript expressions
        </div>
      </div>
    </div>
  )
}
