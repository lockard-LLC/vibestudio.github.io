// File System Service for Real File Operations
// Note: Tauri is optional - will fallback to web APIs when not available

export interface FileSystemItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  children?: FileSystemItem[]
  extension?: string
}

export interface SearchResult {
  file: string
  line: number
  column: number
  text: string
  preview: string
}

export class FileSystemService {
  private static instance: FileSystemService
  private currentWorkingDirectory: string = ''

  static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService()
    }
    return FileSystemService.instance
  }

  async getCurrentWorkingDirectory(): Promise<string> {
    // For web development, use mock directory
    this.currentWorkingDirectory = '/home/jerry/vibestudio'
    return this.currentWorkingDirectory
  }

  async readDirectory(path: string): Promise<FileSystemItem[]> {
    // For web development, use mock data
    return this.getMockFileStructure(path)
  }

  async searchFiles(query: string): Promise<SearchResult[]> {
    // For web development, use mock search results
    return this.getMockSearchResults(query)
  }

  async readFile(path: string): Promise<string> {
    try {
      // Web fallback using fetch for local development
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`)
      if (!response.ok) throw new Error('Failed to read file')
      return await response.text()
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      // Web fallback
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content })
      })
      
      if (!response.ok) throw new Error('Failed to write file')
    } catch (error) {
      console.error('Failed to write file:', error)
      throw error
    }
  }

  async createDirectory(path: string): Promise<void> {
    try {
      // Web fallback
      const response = await fetch('/api/directories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      })
      
      if (!response.ok) throw new Error('Failed to create directory')
    } catch (error) {
      console.error('Failed to create directory:', error)
      throw error
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      // Web fallback
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete file')
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }


  private getMockFileStructure(path: string): FileSystemItem[] {
    // Mock file structure for development
    const basePath = '/home/jerry/vibestudio'
    
    if (path === basePath || path === '') {
      return [
        {
          name: 'src',
          path: `${basePath}/src`,
          type: 'directory',
          children: [
            {
              name: 'ui',
              path: `${basePath}/src/ui`,
              type: 'directory',
              children: [
                {
                  name: 'sidebar',
                  path: `${basePath}/src/ui/sidebar`,
                  type: 'directory',
                  children: [
                    {
                      name: 'ActivityBarFinal.tsx',
                      path: `${basePath}/src/ui/sidebar/ActivityBarFinal.tsx`,
                      type: 'file',
                      extension: 'tsx',
                      size: 14952
                    },
                    {
                      name: 'SidebarEnhanced.tsx',
                      path: `${basePath}/src/ui/sidebar/SidebarEnhanced.tsx`,
                      type: 'file',
                      extension: 'tsx',
                      size: 14107
                    }
                  ]
                },
                {
                  name: 'statusbar',
                  path: `${basePath}/src/ui/statusbar`,
                  type: 'directory',
                  children: [
                    {
                      name: 'StatusBarAnimated.tsx',
                      path: `${basePath}/src/ui/statusbar/StatusBarAnimated.tsx`,
                      type: 'file',
                      extension: 'tsx',
                      size: 3247
                    }
                  ]
                }
              ]
            },
            {
              name: 'core',
              path: `${basePath}/src/core`,
              type: 'directory',
              children: [
                {
                  name: 'editor',
                  path: `${basePath}/src/core/editor`,
                  type: 'directory',
                  children: [
                    {
                      name: 'EditorAreaAnimated.tsx',
                      path: `${basePath}/src/core/editor/EditorAreaAnimated.tsx`,
                      type: 'file',
                      extension: 'tsx',
                      size: 5621
                    },
                    {
                      name: 'MonacoEditor.tsx',
                      path: `${basePath}/src/core/editor/MonacoEditor.tsx`,
                      type: 'file',
                      extension: 'tsx',
                      size: 4892
                    }
                  ]
                }
              ]
            },
            {
              name: 'App.tsx',
              path: `${basePath}/src/App.tsx`,
              type: 'file',
              extension: 'tsx',
              size: 1847
            }
          ]
        },
        {
          name: 'package.json',
          path: `${basePath}/package.json`,
          type: 'file',
          extension: 'json',
          size: 2156
        },
        {
          name: 'README.md',
          path: `${basePath}/README.md`,
          type: 'file',
          extension: 'md',
          size: 892
        },
        {
          name: 'CLAUDE.md',
          path: `${basePath}/CLAUDE.md`,
          type: 'file',
          extension: 'md',
          size: 4231
        }
      ]
    }
    
    return []
  }

  private getMockSearchResults(query: string): SearchResult[] {
    // Mock search results for development
    return [
      {
        file: '/home/jerry/vibestudio/src/App.tsx',
        line: 2,
        column: 12,
        text: `import { ActivityBarFinal as ActivityBar } from './ui/sidebar/ActivityBarFinal'`,
        preview: 'import { ActivityBarFinal as ActivityBar } from...'
      },
      {
        file: '/home/jerry/vibestudio/src/ui/sidebar/ActivityBarFinal.tsx',
        line: 37,
        column: 14,
        text: `export const ActivityBarFinal: React.FC<ActivityBarProps> = ({`,
        preview: 'export const ActivityBarFinal: React.FC<ActivityBarProps>...'
      },
      {
        file: '/home/jerry/vibestudio/src/ui/sidebar/SidebarEnhanced.tsx',
        line: 21,
        column: 17,
        text: `export const SidebarEnhanced: React.FC<SidebarProps> = ({ activeView, onCollapse }) => {`,
        preview: 'export const SidebarEnhanced: React.FC<SidebarProps>...'
      }
    ].filter(result => 
      result.text.toLowerCase().includes(query.toLowerCase()) ||
      result.file.toLowerCase().includes(query.toLowerCase())
    )
  }

  getFileIcon(extension?: string): string {
    const iconMap: Record<string, string> = {
      'tsx': '⚛️',
      'ts': '🔷',
      'js': '🟨',
      'jsx': '⚛️',
      'json': '📄',
      'md': '📝',
      'css': '🎨',
      'scss': '🎨',
      'html': '🌐',
      'py': '🐍',
      'rs': '🦀',
      'go': '🔵',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'php': '🐘',
      'rb': '💎',
      'vue': '💚',
      'svelte': '🧡',
      'yaml': '📋',
      'yml': '📋',
      'toml': '📋',
      'xml': '📄',
      'svg': '🖼️',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'pdf': '📕',
      'zip': '📦',
      'tar': '📦',
      'gz': '📦'
    }
    
    return iconMap[extension?.toLowerCase() || ''] || '📄'
  }
}

export default FileSystemService.getInstance()