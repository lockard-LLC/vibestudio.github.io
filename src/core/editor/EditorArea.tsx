// src/core/editor/EditorArea.tsx (File System Integrated Version)
import React, { useState, useCallback, useEffect } from 'react'
import { X, Plus, Save, FileText } from 'lucide-react'
import { MonacoEditor } from './MonacoEditor'
import { useFileSystemStore } from '../../shared/stores/fileSystemStore'
import { FileSystemItem } from '../../shared/types/fileSystem'
import { getFileIcon, getLanguageFromFilename } from '../../shared/utils/fileUtils'

interface EditorTab {
  id: string
  file: FileSystemItem
  isDirty: boolean
  originalContent: string
}

export const EditorArea: React.FC = () => {
  const {
    selectedFile,
    getFile,
    updateFileContent,
    files
  } = useFileSystemStore()

  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  // Open file when selected in explorer
  useEffect(() => {
    if (selectedFile) {
      const file = getFile(selectedFile)
      if (file && file.type === 'file') {
        openFile(file)
      }
    }
  }, [selectedFile, getFile])

  const openFile = useCallback((file: FileSystemItem) => {
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.file.path === file.path)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    // Create new tab
    const newTab: EditorTab = {
      id: file.path,
      file: { ...file },
      isDirty: false,
      originalContent: file.content || ''
    }

    setTabs(prevTabs => [...prevTabs, newTab])
    setActiveTabId(newTab.id)
  }, [tabs])

  const closeTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab?.isDirty) {
      const shouldClose = window.confirm(`${tab.file.name} has unsaved changes. Close anyway?`)
      if (!shouldClose) return
    }

    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)

    // Switch to another tab if closing active tab
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id)
      } else {
        setActiveTabId(null)
      }
    }
  }, [tabs, activeTabId])

  const saveTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    // Update file in store
    updateFileContent(tab.file.path, tab.file.content || '')
    
    // Update tab state
    setTabs(prevTabs =>
      prevTabs.map(t =>
        t.id === tabId
          ? { ...t, isDirty: false, originalContent: t.file.content || '' }
          : t
      )
    )
  }, [tabs, updateFileContent])

  const saveAllTabs = useCallback(() => {
    tabs.filter(tab => tab.isDirty).forEach(tab => saveTab(tab.id))
  }, [tabs, saveTab])

  const handleContentChange = useCallback((tabId: string, content: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              file: { ...tab.file, content },
              isDirty: content !== tab.originalContent
            }
          : tab
      )
    )
  }, [])

  const createNewFile = useCallback(() => {
    const newFileContent = `// New file created in VibeStudio
// Your Creative Code Space

console.log("Hello from VibeStudio!")
`
    
    const newFile: FileSystemItem = {
      id: `untitled-${Date.now()}`,
      name: 'untitled.js',
      type: 'file',
      path: `untitled-${Date.now()}.js`,
      content: newFileContent,
      language: 'javascript',
      lastModified: new Date()
    }

    openFile(newFile)
  }, [openFile])

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            if (activeTabId) {
              saveTab(activeTabId)
            }
            break
          case 'S': // Shift+Ctrl+S
            if (e.shiftKey) {
              e.preventDefault()
              saveAllTabs()
            }
            break
          case 'n':
            e.preventDefault()
            createNewFile()
            break
          case 'w':
            e.preventDefault()
            if (activeTabId) {
              closeTab(activeTabId)
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, saveTab, saveAllTabs, createNewFile, closeTab])

  return (
    <div className="flex-1 flex flex-col bg-primary">
      {/* Tab Bar */}
      <div className="h-10 bg-secondary border-b border-border flex items-center">
        <div className="flex items-center overflow-x-auto flex-1">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTabId === tab.id}
              onSelect={() => setActiveTabId(tab.id)}
              onClose={() => closeTab(tab.id)}
              onSave={() => saveTab(tab.id)}
            />
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center border-l border-border">
          <button
            onClick={createNewFile}
            className="h-10 px-3 flex items-center space-x-2 hover:bg-accent/10 transition-colors"
            title="New File (Ctrl+N)"
          >
            <Plus size={16} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">New</span>
          </button>
          
          {tabs.some(tab => tab.isDirty) && (
            <button
              onClick={saveAllTabs}
              className="h-10 px-3 flex items-center space-x-2 hover:bg-success/10 transition-colors"
              title="Save All (Ctrl+Shift+S)"
            >
              <Save size={16} className="text-success" />
              <span className="text-sm text-success">Save All</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        {activeTab ? (
          <EditorContent
            tab={activeTab}
            onContentChange={(content) => handleContentChange(activeTab.id, content)}
          />
        ) : (
          <WelcomeScreen 
            onCreateFile={createNewFile}
            hasFiles={files.length > 0}
          />
        )}
      </div>
    </div>
  )
}

interface TabButtonProps {
  tab: EditorTab
  isActive: boolean
  onSelect: () => void
  onClose: () => void
  onSave: () => void
}

const TabButton: React.FC<TabButtonProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
  onSave
}) => {
  return (
    <div
      className={`
        flex items-center h-10 px-4 border-r border-border cursor-pointer
        transition-all duration-200 relative group min-w-0 max-w-48
        ${isActive 
          ? 'bg-primary text-text-primary' 
          : 'bg-secondary hover:bg-primary/50 text-text-secondary hover:text-text-primary'
        }
      `}
      onClick={onSelect}
    >
      {/* File Icon */}
      <div className="mr-2 text-sm leading-none flex-shrink-0">
        {getFileIcon(tab.file.name)}
      </div>

      {/* File Name */}
      <span className="text-sm truncate flex-1" title={tab.file.path}>
        {tab.file.name}
      </span>
      
      {/* Dirty Indicator */}
      {tab.isDirty && (
        <div className="w-2 h-2 bg-accent rounded-full ml-2 flex-shrink-0" />
      )}
      
      {/* Actions */}
      <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {tab.isDirty && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSave()
            }}
            className="w-4 h-4 flex items-center justify-center rounded hover:bg-success/20"
            title="Save (Ctrl+S)"
          >
            <Save size={10} className="text-success" />
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="w-4 h-4 flex items-center justify-center rounded hover:bg-error/20"
          title="Close (Ctrl+W)"
        >
          <X size={12} className="text-text-secondary hover:text-error" />
        </button>
      </div>
      
      {/* Active Tab Indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
      )}
    </div>
  )
}

interface EditorContentProps {
  tab: EditorTab
  onContentChange: (content: string) => void
}

const EditorContent: React.FC<EditorContentProps> = ({ tab, onContentChange }) => {
  return (
    <div className="h-full bg-primary relative">
      {/* File Path Breadcrumb */}
      <div className="absolute top-2 right-4 z-10 bg-secondary/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-text-muted">
        {tab.file.path}
      </div>
      
      <MonacoEditor
        value={tab.file.content || ''}
        language={tab.file.language || getLanguageFromFilename(tab.file.name)}
        onChange={onContentChange}
        onMount={(editor, monaco) => {
          // File-specific editor configuration
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            console.log(`Save ${tab.file.name}`)
          })
        }}
      />
    </div>
  )
}

interface WelcomeScreenProps {
  onCreateFile: () => void
  hasFiles: boolean
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateFile, hasFiles }) => {
  const sampleActions = [
    {
      title: 'Create New File',
      description: 'Start with a blank file',
      icon: Plus,
      action: onCreateFile,
      shortcut: 'Ctrl+N'
    },
    {
      title: 'Open from Explorer',
      description: 'Browse and open existing files',
      icon: FileText,
      action: () => console.log('Open explorer'),
      shortcut: 'Click files in sidebar'
    }
  ]

  return (
    <div className="h-full flex items-center justify-center bg-primary">
      <div className="text-center max-w-2xl mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-text-primary">VibeStudio</h1>
          <p className="text-2xl text-accent mb-2 font-medium">Code with Vibe</p>
          <p className="text-xl text-text-secondary mb-4">Where Code Meets Flow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {sampleActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-6 bg-secondary hover:bg-accent/10 rounded-xl border border-border transition-all duration-200 hover:shadow-lg text-left"
              >
                <div className="flex items-center mb-3">
                  <Icon size={20} className="text-accent mr-3" />
                  <div className="text-sm font-medium text-text-primary">
                    {action.title}
                  </div>
                </div>
                <div className="text-xs text-text-muted mb-2">
                  {action.description}
                </div>
                <div className="text-xs text-accent">
                  {action.shortcut}
                </div>
              </button>
            )
          })}
        </div>

        {hasFiles && (
          <div className="p-4 bg-info/10 rounded-xl border border-info/20 mb-8">
            <p className="text-sm text-info">
              💡 Click on files in the explorer sidebar to open them
            </p>
          </div>
        )}
        
        <div className="p-6 bg-gradient-to-r from-accent/10 to-secondary rounded-2xl border border-border mb-8">
          <p className="text-lg text-accent font-medium mb-2">Your Creative Code Space</p>
          <p className="text-sm text-text-secondary">
            File system integrated • Auto-save • Real-time sync
          </p>
        </div>

        <div className="text-xs text-text-muted space-y-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <kbd className="px-2 py-1 bg-secondary rounded">Ctrl+N</kbd> New file
            </div>
            <div>
              <kbd className="px-2 py-1 bg-secondary rounded">Ctrl+S</kbd> Save file
            </div>
            <div>
              <kbd className="px-2 py-1 bg-secondary rounded">Ctrl+W</kbd> Close tab
            </div>
            <div>
              <kbd className="px-2 py-1 bg-secondary rounded">Ctrl+Shift+S</kbd> Save all
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
