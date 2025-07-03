// src/shared/types/fileSystem.ts
export interface FileSystemItem {
    id: string
    name: string
    type: 'file' | 'folder'
    path: string
    parentId?: string
    content?: string
    size?: number
    lastModified?: Date
    children?: FileSystemItem[]
    isExpanded?: boolean
    language?: string
    isDirty?: boolean
  }
  
  export interface FileOperation {
    type: 'create' | 'update' | 'delete' | 'rename' | 'move'
    item: FileSystemItem
    oldPath?: string
    newPath?: string
    timestamp: Date
  }
  
  export interface ProjectStructure {
    id: string
    name: string
    rootPath: string
    files: FileSystemItem[]
    lastModified: Date
    settings?: ProjectSettings
  }
  
  export interface ProjectSettings {
    theme: 'light' | 'dark'
    fontSize: number
    tabSize: number
    wordWrap: boolean
    minimap: boolean
    autoSave: boolean
    formatOnSave: boolean
  }
  
  