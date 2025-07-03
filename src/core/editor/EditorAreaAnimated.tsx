// Enhanced EditorArea with Smooth Tab Animations
import React, { useState, useCallback, useRef } from 'react'
import { X, Plus, Save, Code2 } from 'lucide-react'
import { MonacoEditor } from './MonacoEditor'

interface Tab {
  id: string
  title: string
  content: string
  language: string
  isDirty: boolean
  path?: string
  isClosing?: boolean
}

export const EditorAreaAnimated: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      title: 'App.tsx',
      content: `import React from 'react'
import { ActivityBarFinal } from './ui/sidebar/ActivityBarFinal'
import { SidebarEnhanced } from './ui/sidebar/SidebarEnhanced'
import { EditorAreaAnimated } from './core/editor/EditorAreaAnimated'
import { StatusBarAnimated } from './ui/statusbar/StatusBarAnimated'
import { PanelAnimated } from './ui/panels/PanelAnimated'
import { ThemeProvider } from './shared/hooks/useTheme'

function App() {
  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col bg-primary text-text-primary">
        <h1 className="text-4xl font-bold text-center py-8">
          Welcome to VibeStudio ✨
        </h1>
        <p className="text-center text-accent text-xl mb-4">
          Where Code Meets Flow
        </p>
        <div className="text-center text-text-secondary">
          Your Creative Code Space with Smooth Animations
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App`,
      language: 'typescript',
      isDirty: false,
      path: 'src/App.tsx'
    }
  ])
  
  const [activeTab, setActiveTab] = useState('1')
  const [draggedTab, setDraggedTab] = useState<string | null>(null)
  const [dragOverTab, setDragOverTab] = useState<string | null>(null)
  const [newTabCounter, setNewTabCounter] = useState(2)
  const closeTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const handleContentChange = useCallback((tabId: string, newContent: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, content: newContent, isDirty: tab.content !== newContent }
          : tab
      )
    )
  }, [])

  const closeTab = useCallback((tabId: string) => {
    const tabToClose = tabs.find(tab => tab.id === tabId)
    if (tabToClose?.isDirty) {
      const shouldClose = window.confirm(`${tabToClose.title} has unsaved changes. Close anyway?`)
      if (!shouldClose) return
    }

    // Start closing animation
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId ? { ...tab, isClosing: true } : tab
      )
    )

    // Remove tab after animation
    const timeout = setTimeout(() => {
      setTabs(prevTabs => {
        const newTabs = prevTabs.filter(tab => tab.id !== tabId)
        
        // Update active tab if needed
        if (activeTab === tabId && newTabs.length > 0) {
          const currentIndex = prevTabs.findIndex(tab => tab.id === tabId)
          const nextTab = newTabs[Math.min(currentIndex, newTabs.length - 1)]
          setActiveTab(nextTab.id)
        }
        
        return newTabs
      })
      
      closeTimeoutRef.current.delete(tabId)
    }, 200)

    closeTimeoutRef.current.set(tabId, timeout)
  }, [tabs, activeTab])

  const saveTab = useCallback((tabId: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isDirty: false }
          : tab
      )
    )
    
    // Add save feedback animation
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`)
    if (tabElement) {
      tabElement.classList.add('save-feedback')
      setTimeout(() => {
        tabElement.classList.remove('save-feedback')
      }, 600)
    }
  }, [])

  const createNewTab = useCallback(() => {
    const newId = `tab-${newTabCounter}`
    const newTab: Tab = {
      id: newId,
      title: `untitled-${newTabCounter}.txt`,
      content: '// Start coding...\n',
      language: 'javascript',
      isDirty: false
    }
    
    setTabs(prevTabs => [...prevTabs, newTab])
    setActiveTab(newId)
    setNewTabCounter(prev => prev + 1)
  }, [newTabCounter])

  // Drag and drop for tab reordering
  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tabId)
  }

  const handleTabDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault()
    if (draggedTab && draggedTab !== tabId) {
      setDragOverTab(tabId)
    }
  }

  const handleTabDragLeave = () => {
    setDragOverTab(null)
  }

  const handleTabDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedTab || draggedTab === targetId) {
      setDraggedTab(null)
      setDragOverTab(null)
      return
    }

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTab)
    const targetIndex = tabs.findIndex(tab => tab.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newTabs = [...tabs]
    const [draggedTabData] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(targetIndex, 0, draggedTabData)

    setTabs(newTabs)
    setDraggedTab(null)
    setDragOverTab(null)
  }

  const handleTabDragEnd = () => {
    setDraggedTab(null)
    setDragOverTab(null)
  }

  const getLanguageIcon = (language: string) => {
    const iconMap = {
      'typescript': '🔷',
      'javascript': '🟡',
      'css': '🎨',
      'html': '🌐',
      'json': '📦',
      'markdown': '📝',
      'python': '🐍',
      'rust': '🦀',
      'go': '🐹',
      'java': '☕'
    }
    return iconMap[language as keyof typeof iconMap] || '📄'
  }

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="flex-1 flex flex-col bg-primary overflow-hidden">
      {/* Tab Bar with Enhanced Animations */}
      <div className="h-10 bg-secondary border-b border-border flex items-center overflow-hidden">
        <div className="flex items-center overflow-x-auto flex-1 smooth-scroll">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              className={`
                flex items-center relative group
                ${tab.isClosing ? 'tab-closing' : ''}
                ${draggedTab === tab.id ? 'opacity-50 scale-95' : ''}
                ${dragOverTab === tab.id ? 'border-l-2 border-accent' : ''}
              `}
              style={{
                transitionDelay: tab.isClosing ? '0ms' : `${index * 30}ms`
              }}
              draggable
              onDragStart={(e) => handleTabDragStart(e, tab.id)}
              onDragOver={(e) => handleTabDragOver(e, tab.id)}
              onDragLeave={handleTabDragLeave}
              onDrop={(e) => handleTabDrop(e, tab.id)}
              onDragEnd={handleTabDragEnd}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 h-10 border-r border-border
                  transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)
                  relative overflow-hidden min-w-0 max-w-48
                  ${activeTab === tab.id 
                    ? 'bg-primary text-text-primary shadow-sm' 
                    : 'bg-secondary hover:bg-primary/50 text-text-secondary hover:text-text-primary'
                  }
                  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-inset
                `}
              >
                {/* Language Icon */}
                <span className="text-xs mr-2 flex-shrink-0">
                  {getLanguageIcon(tab.language)}
                </span>
                
                <span className="text-sm truncate flex-1 font-medium">
                  {tab.title}
                </span>
                
                {/* Dirty indicator */}
                {tab.isDirty && (
                  <div className="w-2 h-2 bg-accent rounded-full mr-2 flex-shrink-0 animate-pulse" />
                )}
                
                {/* Close button with enhanced hover */}
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="
                    w-4 h-4 flex items-center justify-center rounded
                    opacity-0 group-hover:opacity-100 transition-all duration-200
                    hover:bg-error/20 hover:scale-110 transform ml-1 flex-shrink-0
                    focus:outline-none focus:ring-1 focus:ring-error/50
                  "
                  title="Close Tab"
                  tabIndex={0}
                >
                  <X size={10} className="text-text-secondary hover:text-error" />
                </div>
                
                {/* Active tab indicator */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 bg-accent
                  transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)
                  ${activeTab === tab.id 
                    ? 'transform scaleX-100 opacity-100' 
                    : 'transform scaleX-0 opacity-0'
                  }
                `} />
                
                {/* Save feedback animation */}
                <div className="
                  absolute inset-0 bg-success/20 opacity-0
                  transition-opacity duration-300
                  save-feedback-target
                " />
              </button>
            </div>
          ))}
        </div>
        
        {/* New Tab Button with enhanced animation */}
        <button
          onClick={createNewTab}
          className="
            w-10 h-10 flex items-center justify-center flex-shrink-0
            hover:bg-accent/10 transition-all duration-200
            transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-accent/50
            ripple
          "
          title="New File (Ctrl+N)"
        >
          <Plus size={16} className="text-text-secondary hover:text-text-primary" />
        </button>
      </div>

      {/* Editor Content with Smooth Transitions */}
      <div className="flex-1 relative overflow-hidden">
        {currentTab ? (
          <div className="h-full fade-slide-in">
            <EditorContent 
              key={currentTab.id}
              tab={currentTab} 
              onContentChange={(content) => handleContentChange(currentTab.id, content)}
              onSave={() => saveTab(currentTab.id)}
            />
          </div>
        ) : (
          <WelcomeScreen onCreateFile={createNewTab} />
        )}
      </div>
    </div>
  )
}

interface EditorContentProps {
  tab: Tab
  onContentChange: (content: string) => void
  onSave: () => void
}

const EditorContent: React.FC<EditorContentProps> = ({ tab, onContentChange, onSave }) => {
  return (
    <div className="h-full bg-primary relative">
      {/* File info header */}
      <div className="absolute top-2 right-4 z-10 flex items-center space-x-2">
        {tab.isDirty && (
          <button
            onClick={onSave}
            className="
              flex items-center space-x-1 px-2 py-1 rounded
              bg-success/10 text-success text-xs
              hover:bg-success/20 transition-all duration-200
              transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-success/50
            "
            title="Save File (Ctrl+S)"
          >
            <Save size={10} />
            <span>Save</span>
          </button>
        )}
      </div>
      
      <MonacoEditor
        value={tab.content}
        language={tab.language}
        onChange={onContentChange}
        onMount={(editor, monaco) => {
          // Enhanced editor commands
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            onSave()
          })
          
          // Add smooth scrolling
          editor.updateOptions({
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on'
          })
        }}
      />
    </div>
  )
}

const WelcomeScreen: React.FC<{ onCreateFile: () => void }> = ({ onCreateFile }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  
  const sampleFiles = [
    { 
      name: 'React Component', 
      ext: '.tsx', 
      icon: '⚛️',
      color: 'from-blue-500/10 to-cyan-500/10',
      content: 'import React from \'react\'\n\nfunction Component() {\n  return (\n    <div>\n      <h1>Hello VibeStudio!</h1>\n    </div>\n  )\n}\n\nexport default Component' 
    },
    { 
      name: 'Stylesheet', 
      ext: '.css', 
      icon: '🎨',
      color: 'from-purple-500/10 to-pink-500/10',
      content: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}\n\n.title {\n  color: #2196F3;\n  font-size: 2rem;\n  font-weight: bold;\n  text-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}' 
    },
    { 
      name: 'TypeScript', 
      ext: '.ts', 
      icon: '🔷',
      color: 'from-green-500/10 to-emerald-500/10',
      content: 'interface User {\n  id: number\n  name: string\n  email: string\n  avatar?: string\n}\n\nfunction greetUser(user: User): string {\n  return `Hello, ${user.name}! Welcome to VibeStudio.`\n}\n\nexport { User, greetUser }' 
    }
  ]

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary/30">
      <div className="text-center max-w-4xl mx-auto px-8 fade-slide-in">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4 text-text-primary">
            Vibe<span className="text-accent">Studio</span>
          </h1>
          <p className="text-2xl text-accent mb-2 font-medium">Code with Vibe</p>
          <p className="text-xl text-text-secondary mb-4">Where Code Meets Flow</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-text-muted">
            <Code2 size={16} />
            <span>Enhanced with smooth animations and micro-interactions</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
          {sampleFiles.map((file, index) => (
            <button
              key={index}
              onClick={onCreateFile}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`
                p-6 rounded-2xl border border-border
                bg-gradient-to-br ${file.color}
                transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                transform hover:scale-105 hover:shadow-lg
                ${hoveredCard === index ? 'shadow-xl -translate-y-2' : 'hover:-translate-y-1'}
                focus:outline-none focus:ring-2 focus:ring-accent/50
                group
              `}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="text-4xl mb-4 transition-transform duration-200 group-hover:scale-110">
                {file.icon}
              </div>
              <div className="text-lg font-semibold text-text-primary mb-2">
                {file.name}
              </div>
              <div className="text-sm text-text-secondary">
                Create {file.ext} file
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-16 p-8 bg-gradient-to-r from-accent/5 to-success/5 rounded-3xl border border-border">
          <p className="text-xl text-accent font-semibold mb-3">Your Creative Code Space</p>
          <p className="text-text-secondary mb-6">
            Experience the future of web-based development with smooth animations, 
            intelligent code completion, and a beautiful interface designed for flow.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-text-muted">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Monaco Editor Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>AI-Ready Architecture</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
              <span>Modern Workflow</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-text-muted space-y-2">
          <p>Press <kbd className="px-2 py-1 bg-secondary rounded font-mono">Ctrl+N</kbd> to create a new file</p>
          <p>Press <kbd className="px-2 py-1 bg-secondary rounded font-mono">Ctrl+P</kbd> to open quick search</p>
          <p>Press <kbd className="px-2 py-1 bg-secondary rounded font-mono">Ctrl+S</kbd> to save current file</p>
        </div>
      </div>
    </div>
  )
}

// Add save feedback animation styles
const style = document.createElement('style')
style.textContent = `
  .save-feedback .save-feedback-target {
    opacity: 1 !important;
    animation: saveFlash 0.6s ease-out;
  }
  
  @keyframes saveFlash {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }
`
document.head.appendChild(style)