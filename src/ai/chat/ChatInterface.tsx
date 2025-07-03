// src/ai/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  FileText, 
  Settings,
  Plus,
  Trash2,
  MessageSquare,
  Zap,
  Brain
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAIChatStore } from '../../shared/stores/aiChatStore'
import { useTheme } from '../../shared/hooks/useTheme'
import { useFileSystemStore } from '../../shared/stores/fileSystemStore'
import { ChatMessage } from '../../shared/types/aiChat'

export const ChatInterface: React.FC = () => {
  const {
    currentSession,
    sessions,
    selectedModel,
    isConnected,
    isStreaming,
    connectionStatus,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    connect
  } = useAIChatStore()

  const { theme } = useTheme()
  const { selectedFile, getFile } = useFileSystemStore()
  
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [includeFileContext, setIncludeFileContext] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages])

  // Auto-connect on mount
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      connect()
    }
  }, [connectionStatus, connect])

  // Create initial session if none exists
  useEffect(() => {
    if (!currentSession && sessions.length === 0) {
      createSession('Welcome Chat')
    }
  }, [currentSession, sessions.length, createSession])

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming || !isConnected) return

    const messageContent = input.trim()
    setInput('')

    // Prepare context
    let context = undefined
    if (includeFileContext && selectedFile) {
      const file = getFile(selectedFile)
      if (file) {
        context = {
          files: [selectedFile],
          currentFile: selectedFile,
          selectedCode: file.content
        }
      }
    }

    await sendMessage(messageContent, context)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success'
      case 'connecting': return 'text-warning'
      case 'error': return 'text-error'
      default: return 'text-text-muted'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Connection Error'
      default: return 'Disconnected'
    }
  }

  return (
    <div className="h-full flex flex-col bg-primary">
      {/* Chat Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-secondary">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Brain size={20} className="text-accent" />
            <div>
              <div className="text-sm font-medium text-text-primary">
                Your Creative Code Space
              </div>
              <div className={`text-xs ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()} • {selectedModel.name}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => createSession()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent/10 transition-colors"
            title="New Chat"
          >
            <Plus size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent/10 transition-colors"
            title="Settings"
          >
            <Settings size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Chat Sessions Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-border bg-secondary flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-medium text-text-primary">Chat Sessions</h3>
          </div>
          
          <div className="flex-1 overflow-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={`
                  p-3 border-b border-border/50 cursor-pointer transition-colors group
                  ${currentSession?.id === session.id 
                    ? 'bg-accent/10 border-l-2 border-l-accent' 
                    : 'hover:bg-primary/50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {session.messages.length} messages
                    </div>
                    <div className="text-xs text-text-muted">
                      {session.lastMessageAt.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-error/20 transition-all"
                  >
                    <Trash2 size={12} className="text-error" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {currentSession?.messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                onCopy={copyToClipboard}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            {includeFileContext && selectedFile && (
              <div className="mb-3 p-2 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText size={14} className="text-info" />
                  <span className="text-info">
                    Including context from: {selectedFile}
                  </span>
                  <button
                    onClick={() => setIncludeFileContext(false)}
                    className="text-info hover:text-info/80 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isConnected 
                      ? "Ask me anything about your code..." 
                      : "Connecting to AI service..."
                  }
                  disabled={!isConnected || isStreaming}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                  rows={Math.min(Math.max(1, input.split('\n').length), 5)}
                />
                
                {input.trim() && (
                  <div className="absolute bottom-2 right-2 text-xs text-text-muted">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || !isConnected || isStreaming}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl transition-colors
                  ${input.trim() && isConnected && !isStreaming
                    ? 'bg-accent text-white hover:bg-accent/90' 
                    : 'bg-secondary text-text-muted cursor-not-allowed'
                  }
                `}
              >
                {isStreaming ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFileContext}
                    onChange={(e) => setIncludeFileContext(e.target.checked)}
                    className="rounded border border-border"
                  />
                  <span>Include file context</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>Powered by {selectedModel.name}</span>
                <Zap size={12} className="text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ChatMessageComponentProps {
  message: ChatMessage
  onCopy: (text: string) => void
}

const ChatMessageComponent: React.FC<ChatMessageComponentProps> = ({ message, onCopy }) => {
  const { theme } = useTheme()
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-md p-4 bg-accent/10 rounded-xl text-center">
          <Brain size={24} className="mx-auto mb-2 text-accent" />
          <div className="text-sm text-accent font-medium mb-2">
            VibeStudio AI Assistant
          </div>
          <div className="text-xs text-text-secondary">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-accent' : 'bg-secondary border border-border'}
        `}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-accent" />
          )}
        </div>

        {/* Message Content */}
        <div className={`
          p-4 rounded-xl relative group
          ${isUser 
            ? 'bg-accent text-white' 
            : 'bg-secondary border border-border'
          }
        `}>
          {/* Message Text */}
          <div className={`prose prose-sm max-w-none ${
            theme === 'dark' ? 'prose-invert' : ''
          } ${isUser ? 'prose-white' : ''}`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  
                  if (!inline && language) {
                    return (
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-text-muted font-mono">
                            {language}
                          </span>
                          <button
                            onClick={() => onCopy(String(children))}
                            className="text-xs text-text-muted hover:text-text-secondary flex items-center space-x-1"
                          >
                            <Copy size={12} />
                            <span>Copy</span>
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={theme === 'dark' ? oneDark : oneLight}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                  
                  return (
                    <code className={`${className} px-1 py-0.5 rounded bg-accent/20 text-accent font-mono text-sm`} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Streaming indicator */}
          {message.isStreaming && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-text-muted">AI is thinking...</span>
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={() => onCopy(message.content)}
            className={`
              absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded
              opacity-0 group-hover:opacity-100 transition-opacity
              ${isUser ? 'hover:bg-white/20' : 'hover:bg-accent/10'}
            `}
            title="Copy message"
          >
            <Copy size={12} />
          </button>

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-text-muted'}`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SettingsPanelProps {
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const {
    selectedModel,
    availableModels,
    providers,
    setSelectedModel,
    updateProviderConnection
  } = useAIChatStore()

  return (
    <div className="border-b border-border bg-secondary p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-primary">AI Settings</h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            AI Model
          </label>
          <select
            value={selectedModel.id}
            onChange={(e) => {
              const model = availableModels.find(m => m.id === e.target.value)
              if (model) setSelectedModel(model)
            }}
            className="w-full px-3 py-2 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
          <div className="text-xs text-text-muted mt-1">
            Max tokens: {selectedModel.maxTokens.toLocaleString()}
            {selectedModel.costPer1kTokens && (
              <span> • ${selectedModel.costPer1kTokens}/1K tokens</span>
            )}
          </div>
        </div>

        {/* Provider Status */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Providers
          </label>
          <div className="space-y-2">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3 bg-primary rounded-lg border border-border"
              >
                <div>
                  <div className="text-sm text-text-primary">{provider.name}</div>
                  <div className="text-xs text-text-muted">
                    {provider.models.length} models available
                  </div>
                </div>
                <div className={`
                  w-3 h-3 rounded-full
                  ${provider.isConnected ? 'bg-success' : 'bg-error'}
                `} />
              </div>
            ))}
          </div>
        </div>

        {/* API Configuration Notice */}
        <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
          <div className="text-sm text-warning font-medium mb-1">
            API Configuration Required
          </div>
          <div className="text-xs text-text-secondary">
            Configure your API keys in the backend .env file to enable AI chat functionality.
          </div>
        </div>
      </div>
    </div>
  )
}