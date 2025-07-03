// src/shared/stores/aiChatStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage, ChatSession, AIModel, ProjectContext, AIProvider } from '../types/aiChat'

// Generate simple ID
const generateId = () => Math.random().toString(36).substr(2, 9)

interface AIChatState {
  // Current session
  currentSession: ChatSession | null
  sessions: ChatSession[]
  
  // AI Configuration
  selectedModel: AIModel
  availableModels: AIModel[]
  providers: AIProvider[]
  
  // Chat state
  isConnected: boolean
  isStreaming: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  
  // Actions
  createSession: (title?: string) => ChatSession
  selectSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  
  // Messaging
  sendMessage: (content: string, context?: ProjectContext) => Promise<void>
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateStreamingMessage: (messageId: string, content: string) => void
  completeStreamingMessage: (messageId: string) => void
  
  // Model management
  setSelectedModel: (model: AIModel) => void
  addProvider: (provider: AIProvider) => void
  updateProviderConnection: (providerId: string, isConnected: boolean) => void
  
  // Context management
  setProjectContext: (context: ProjectContext) => void
  clearContext: () => void
  
  // Connection
  connect: () => Promise<void>
  disconnect: () => void
}

// Default AI models
const defaultModels: AIModel[] = [
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Balanced performance for coding tasks',
    maxTokens: 200000,
    supportsStreaming: true,
    costPer1kTokens: 0.003
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and efficient for quick questions',
    maxTokens: 200000,
    supportsStreaming: true,
    costPer1kTokens: 0.00025
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Advanced reasoning and coding',
    maxTokens: 128000,
    supportsStreaming: true,
    costPer1kTokens: 0.03
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and cost-effective',
    maxTokens: 16384,
    supportsStreaming: true,
    costPer1kTokens: 0.001
  }
]

const defaultProviders: AIProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: defaultModels.filter(m => m.provider === 'anthropic'),
    isConnected: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: defaultModels.filter(m => m.provider === 'openai'),
    isConnected: false
  }
]

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      selectedModel: defaultModels[0],
      availableModels: defaultModels,
      providers: defaultProviders,
      isConnected: false,
      isStreaming: false,
      connectionStatus: 'disconnected',

      createSession: (title) => {
        const newSession: ChatSession = {
          id: generateId(),
          title: title || `Chat ${get().sessions.length + 1}`,
          messages: [
            {
              id: generateId(),
              role: 'system',
              content: `Welcome to VibeStudio - Your Creative Code Space! 

I'm your AI development assistant, ready to help with:
• Code explanations and debugging
• Writing and refactoring code
• Architecture suggestions
• Best practices and optimization
• Documentation and comments
• Learning new technologies

How can I help you code today?`,
              timestamp: new Date()
            }
          ],
          createdAt: new Date(),
          lastMessageAt: new Date(),
          model: get().selectedModel
        }

        set(state => ({
          sessions: [...state.sessions, newSession],
          currentSession: newSession
        }))

        return newSession
      },

      selectSession: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId)
        if (session) {
          set({ currentSession: session })
        }
      },

      deleteSession: (sessionId) => {
        set(state => {
          const newSessions = state.sessions.filter(s => s.id !== sessionId)
          const newCurrentSession = state.currentSession?.id === sessionId 
            ? (newSessions.length > 0 ? newSessions[0] : null)
            : state.currentSession
          
          return {
            sessions: newSessions,
            currentSession: newCurrentSession
          }
        })
      },

      addMessage: (message) => {
        const fullMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date()
        }

        set(state => {
          if (!state.currentSession) return state

          const updatedSession = {
            ...state.currentSession,
            messages: [...state.currentSession.messages, fullMessage],
            lastMessageAt: new Date()
          }

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === state.currentSession?.id ? updatedSession : s
            )
          }
        })
      },

      updateStreamingMessage: (messageId, content) => {
        set(state => {
          if (!state.currentSession) return state

          const updatedMessages = state.currentSession.messages.map(msg =>
            msg.id === messageId 
              ? { ...msg, content, isStreaming: true }
              : msg
          )

          const updatedSession = {
            ...state.currentSession,
            messages: updatedMessages
          }

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === state.currentSession?.id ? updatedSession : s
            )
          }
        })
      },

      completeStreamingMessage: (messageId) => {
        set(state => {
          if (!state.currentSession) return state

          const updatedMessages = state.currentSession.messages.map(msg =>
            msg.id === messageId 
              ? { ...msg, isStreaming: false }
              : msg
          )

          const updatedSession = {
            ...state.currentSession,
            messages: updatedMessages,
            lastMessageAt: new Date()
          }

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === state.currentSession?.id ? updatedSession : s
            ),
            isStreaming: false
          }
        })
      },

      sendMessage: async (content, context) => {
        const { currentSession, selectedModel, addMessage } = get()
        
        if (!currentSession) {
          console.error('No active chat session')
          return
        }

        // Add user message
        addMessage({
          role: 'user',
          content,
          metadata: {
            model: selectedModel.name,
            fileContext: context?.files
          }
        })

        // Add streaming assistant message
        const assistantMessageId = generateId()
        addMessage({
          role: 'assistant',
          content: '',
          isStreaming: true
        })

        set({ isStreaming: true })

        try {
          // Send to backend API
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: currentSession.messages.filter(m => m.role !== 'system'),
              model: selectedModel.id,
              context,
              stream: true
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body reader')
          }

          let assistantResponse = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  get().completeStreamingMessage(assistantMessageId)
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    assistantResponse += parsed.content
                    get().updateStreamingMessage(assistantMessageId, assistantResponse)
                  }
                } catch (e) {
                  console.error('Error parsing streaming response:', e)
                }
              }
            }
          }

        } catch (error) {
          console.error('Error sending message:', error)
          
          // Add error message
          get().updateStreamingMessage(assistantMessageId, 
            `Sorry, I encountered an error: ${(error as Error).message}

Please check your connection and API configuration.`
          )
          get().completeStreamingMessage(assistantMessageId)
        }
      },

      setSelectedModel: (model) => {
        set({ selectedModel: model })
      },

      addProvider: (provider) => {
        set(state => ({
          providers: [...state.providers, provider]
        }))
      },

      updateProviderConnection: (providerId, isConnected) => {
        set(state => ({
          providers: state.providers.map(p =>
            p.id === providerId ? { ...p, isConnected } : p
          )
        }))
      },

      setProjectContext: (context) => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            context
          } : null
        }))
      },

      clearContext: () => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            context: undefined
          } : null
        }))
      },

      connect: async () => {
        set({ connectionStatus: 'connecting' })
        
        try {
          // Test connection to backend
          const response = await fetch('/api/ai/status')
          if (response.ok) {
            set({ 
              isConnected: true, 
              connectionStatus: 'connected' 
            })
          } else {
            throw new Error('Backend not available')
          }
        } catch (error) {
          console.error('Connection failed:', error)
          set({ 
            isConnected: false, 
            connectionStatus: 'error' 
          })
        }
      },

      disconnect: () => {
        set({ 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        })
      }
    }),
    {
      name: 'vibestudio-ai-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        selectedModel: state.selectedModel,
        providers: state.providers
      })
    }
  )
)