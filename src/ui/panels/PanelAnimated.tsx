// Enhanced Panel with Smooth Resize Animations
import React, { useState, useRef, useEffect } from 'react'
import { Terminal, X, Maximize2, FileText, AlertCircle, Play, Square } from 'lucide-react'

interface PanelProps {
  height: number
  onHeightChange: (height: number) => void
  onClose: () => void
}

export const PanelAnimated: React.FC<PanelProps> = ({ height, onHeightChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('terminal')
  const [isResizing, setIsResizing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [resizeStartHeight, setResizeStartHeight] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastMoveTime = useRef(0)
  const lastMoveY = useRef(0)

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: Terminal, badge: null },
    { id: 'output', label: 'Output', icon: FileText, badge: null },
    { id: 'problems', label: 'Problems', icon: AlertCircle, badge: 3 },
  ]

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    setResizeStartY(e.clientY)
    setResizeStartHeight(height)
    lastMoveTime.current = Date.now()
    lastMoveY.current = e.clientY
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const currentTime = Date.now()
      const deltaTime = currentTime - lastMoveTime.current
      const deltaY = e.clientY - lastMoveY.current
      
      // Calculate velocity for momentum
      if (deltaTime > 0) {
        setVelocity(deltaY / deltaTime)
      }
      
      const newHeight = resizeStartHeight - (e.clientY - resizeStartY)
      const clampedHeight = Math.max(100, Math.min(window.innerHeight - 100, newHeight))
      onHeightChange(clampedHeight)
      
      lastMoveTime.current = currentTime
      lastMoveY.current = e.clientY
    }

    const handleMouseUp = () => {
      if (isResizing) {
        // Apply momentum effect
        const momentumHeight = height + (velocity * 50)
        const finalHeight = Math.max(100, Math.min(window.innerHeight - 100, momentumHeight))
        
        if (Math.abs(finalHeight - height) > 5) {
          // Animate to final position with momentum
          onHeightChange(finalHeight)
        }
      }
      
      setIsResizing(false)
      setVelocity(0)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, height, resizeStartY, resizeStartHeight, velocity, onHeightChange])

  const toggleMaximize = () => {
    if (isMaximized) {
      onHeightChange(250)
    } else {
      onHeightChange(window.innerHeight - 150)
    }
    setIsMaximized(!isMaximized)
  }

  const handleTabChange = (tabId: string) => {
    if (activeTab !== tabId) {
      setActiveTab(tabId)
    }
  }

  return (
    <div 
      ref={panelRef}
      className="bg-primary border-t border-border flex flex-col relative overflow-hidden shadow-lg"
      style={{ 
        height: `${height}px`,
        transition: isResizing ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Enhanced Resize Handle */}
      <div
        className={`
          h-2 cursor-row-resize relative group
          resize-handle flex items-center justify-center
          transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)
          ${isResizing 
            ? 'bg-accent/80 scale-y-150 dragging' 
            : 'bg-border/50 hover:bg-accent/60 hover:scale-y-125'
          }
        `}
        onMouseDown={handleMouseDown}
        title="Drag to resize panel"
      >
        {/* Visual indicator for resize handle */}
        <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-0.5 bg-current rounded-full"></div>
          <div className="w-1 h-0.5 bg-current rounded-full"></div>
          <div className="w-1 h-0.5 bg-current rounded-full"></div>
          <div className="w-1 h-0.5 bg-current rounded-full"></div>
          <div className="w-1 h-0.5 bg-current rounded-full"></div>
        </div>
      </div>

      {/* Panel Header with Enhanced Animation */}
      <div className="h-10 bg-secondary border-b border-border flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center space-x-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)
                  transform hover:scale-105 relative
                  ${isActive 
                    ? 'bg-primary text-text-primary shadow-sm scale-105' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-primary/50'
                  }
                  focus:outline-none focus:ring-2 focus:ring-accent/50
                `}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <Icon 
                  size={14} 
                  className={`
                    transition-all duration-200
                    ${isActive ? 'text-accent' : ''}
                  `}
                />
                <span className="fade-slide-in">{tab.label}</span>
                
                {/* Badge for problems/notifications */}
                {tab.badge && (
                  <div className="
                    w-5 h-5 bg-error text-white text-xs rounded-full 
                    flex items-center justify-center font-bold
                    animate-pulse
                  ">
                    {tab.badge}
                  </div>
                )}
                
                {/* Active tab indicator */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t
                  transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)
                  ${isActive 
                    ? 'transform scaleX-100 opacity-100' 
                    : 'transform scaleX-0 opacity-0'
                  }
                `} />
              </button>
            )
          })}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMaximize}
            className="
              w-6 h-6 flex items-center justify-center rounded
              hover:bg-accent/10 transition-all duration-200
              transform hover:scale-110 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-accent/50
            "
            title={isMaximized ? "Restore Panel" : "Maximize Panel"}
          >
            <Maximize2 
              size={12} 
              className={`
                text-text-secondary transition-all duration-200
                ${isMaximized ? 'rotate-180' : ''}
              `}
            />
          </button>
          
          <button
            onClick={onClose}
            className="
              w-6 h-6 flex items-center justify-center rounded
              hover:bg-error/20 transition-all duration-200
              transform hover:scale-110 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-error/50
            "
            title="Close Panel"
          >
            <X size={12} className="text-text-secondary hover:text-error transition-colors duration-200" />
          </button>
        </div>
      </div>

      {/* Panel Content with Smooth Transitions */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full transition-all duration-300 ease-out">
          {activeTab === 'terminal' && <TerminalView />}
          {activeTab === 'output' && <OutputView />}
          {activeTab === 'problems' && <ProblemsView />}
        </div>
      </div>
    </div>
  )
}

const TerminalView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState([
    { type: 'system', content: '➜ vibestudio git:(main) ✗', timestamp: new Date() },
    { type: 'success', content: 'Welcome to VibeStudio integrated terminal', timestamp: new Date() },
    { type: 'info', content: 'Enhanced with smooth animations and real-time feedback', timestamp: new Date() },
  ])

  const toggleScript = () => {
    setIsRunning(!isRunning)
    if (!isRunning) {
      setLogs(prev => [...prev, { 
        type: 'system', 
        content: '$ npm run dev', 
        timestamp: new Date() 
      }])
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success'
      case 'error': return 'text-error'
      case 'warning': return 'text-warning'
      case 'info': return 'text-info'
      case 'system': return 'text-accent'
      default: return 'text-text-primary'
    }
  }

  return (
    <div className="h-full bg-primary p-4 font-mono text-sm flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-text-secondary text-xs ml-2">bash</span>
        </div>
        
        <button
          onClick={toggleScript}
          className={`
            flex items-center space-x-2 px-3 py-1 rounded
            transition-all duration-200 transform hover:scale-105
            ${isRunning 
              ? 'bg-error/20 text-error hover:bg-error/30' 
              : 'bg-success/20 text-success hover:bg-success/30'
            }
            focus:outline-none focus:ring-2 focus:ring-accent/50
          `}
        >
          {isRunning ? <Square size={12} /> : <Play size={12} />}
          <span className="text-xs">{isRunning ? 'Stop' : 'Run'}</span>
        </button>
      </div>
      
      {/* Terminal Output */}
      <div className="flex-1 overflow-auto smooth-scroll space-y-1">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`
              fade-slide-in ${getLogColor(log.type)}
              transition-all duration-200
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <span className="text-text-muted text-xs mr-2">
              {log.timestamp.toLocaleTimeString()}
            </span>
            {log.content}
          </div>
        ))}
        
        {isRunning && (
          <div className="flex items-center space-x-2 text-accent">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span>Running development server...</span>
          </div>
        )}
      </div>
      
      {/* Terminal Input */}
      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-border">
        <span className="text-accent">$</span>
        <input
          type="text"
          placeholder="Enter command..."
          className="
            flex-1 bg-transparent outline-none text-text-primary
            placeholder-text-muted
            focus:outline-none
          "
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.currentTarget
              if (input.value.trim()) {
                setLogs(prev => [...prev, {
                  type: 'system',
                  content: `$ ${input.value}`,
                  timestamp: new Date()
                }])
                input.value = ''
              }
            }
          }}
        />
      </div>
    </div>
  )
}

const OutputView: React.FC = () => {
  const [outputs] = useState([
    { level: 'info', message: 'Build started...', timestamp: new Date() },
    { level: 'success', message: 'Assets compiled successfully', timestamp: new Date() },
    { level: 'info', message: 'Development server ready on http://localhost:3000', timestamp: new Date() },
  ])

  return (
    <div className="h-full bg-primary p-4 text-sm">
      <div className="space-y-2">
        {outputs.map((output, index) => (
          <div
            key={index}
            className={`
              fade-slide-in flex items-start space-x-3 p-2 rounded
              ${output.level === 'success' ? 'bg-success/10 text-success' : ''}
              ${output.level === 'error' ? 'bg-error/10 text-error' : ''}
              ${output.level === 'warning' ? 'bg-warning/10 text-warning' : ''}
              ${output.level === 'info' ? 'bg-info/10 text-info' : ''}
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <span className="text-xs text-text-muted font-mono">
              {output.timestamp.toLocaleTimeString()}
            </span>
            <span className="flex-1">{output.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ProblemsView: React.FC = () => {
  const [problems] = useState([
    { 
      type: 'error', 
      file: 'src/components/Button.tsx', 
      line: 15, 
      message: 'Property "variant" does not exist on type ButtonProps',
      severity: 'high'
    },
    { 
      type: 'warning', 
      file: 'src/utils/helpers.ts', 
      line: 8, 
      message: 'Unused variable "result"',
      severity: 'medium'
    },
    { 
      type: 'warning', 
      file: 'src/App.tsx', 
      line: 23, 
      message: 'Missing dependency in useEffect hook',
      severity: 'low'
    },
  ])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-error text-error'
      case 'medium': return 'border-l-warning text-warning'
      case 'low': return 'border-l-info text-info'
      default: return 'border-l-text-muted text-text-muted'
    }
  }

  return (
    <div className="h-full bg-primary p-4 text-sm">
      <div className="space-y-2">
        {problems.map((problem, index) => (
          <div
            key={index}
            className={`
              fade-slide-in border-l-4 pl-3 pr-2 py-2 rounded-r
              hover:bg-secondary/50 transition-all duration-200
              cursor-pointer transform hover:scale-[1.02]
              ${getSeverityColor(problem.severity)}
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{problem.file}</span>
              <span className="text-xs text-text-muted">Line {problem.line}</span>
            </div>
            <p className="text-text-secondary mt-1">{problem.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}