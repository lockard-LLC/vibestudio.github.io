// src/shared/types/aiChat.ts
export interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    isStreaming?: boolean
    metadata?: {
      model?: string
      tokens?: number
      fileContext?: string[]
      codeBlocks?: CodeBlock[]
    }
  }
  
  export interface CodeBlock {
    language: string
    code: string
    filename?: string
    startLine?: number
    endLine?: number
  }
  
  export interface ChatSession {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
    lastMessageAt: Date
    model: AIModel
    context?: ProjectContext
  }
  
  export interface AIModel {
    id: string
    name: string
    provider: 'anthropic' | 'openai' | 'local'
    description: string
    maxTokens: number
    supportsStreaming: boolean
    costPer1kTokens?: number
  }
  
  export interface ProjectContext {
    files: string[]
    currentFile?: string
    selectedCode?: string
    projectStructure?: any
    dependencies?: string[]
  }
  
  export interface AIProvider {
    id: string
    name: string
    models: AIModel[]
    isConnected: boolean
    apiKey?: string
  }
  
  