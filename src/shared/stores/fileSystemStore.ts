// src/shared/stores/fileSystemStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FileSystemItem, ProjectStructure } from '../types/fileSystem'
import { generatePath, getParentPath, validateFileName, createDefaultFileContent, getLanguageFromFilename } from '../utils/fileUtils'

interface FileSystemState {
  // Current project
  currentProject: ProjectStructure | null
  
  // File operations
  files: FileSystemItem[]
  expandedFolders: Set<string>
  selectedFile: string | null
  
  // Actions
  createProject: (name: string) => void
  loadProject: (project: ProjectStructure) => void
  saveProject: () => void
  
  // File operations
  createFile: (parentPath: string, name: string, isFolder?: boolean) => FileSystemItem | null
  deleteFile: (path: string) => boolean
  renameFile: (path: string, newName: string) => boolean
  moveFile: (fromPath: string, toPath: string) => boolean
  updateFileContent: (path: string, content: string) => void
  
  // Navigation
  toggleFolder: (path: string) => void
  selectFile: (path: string) => void
  
  // Utilities
  getFile: (path: string) => FileSystemItem | null
  getFilesInFolder: (folderPath: string) => FileSystemItem[]
  searchFiles: (query: string) => FileSystemItem[]
  exportProject: () => void
  importProject: (files: File[]) => Promise<void>
}

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      files: [],
      expandedFolders: new Set(['src']),
      selectedFile: null,

      createProject: (name: string) => {
        const project: ProjectStructure = {
          id: Date.now().toString(),
          name,
          rootPath: '',
          lastModified: new Date(),
          files: [
            {
              id: 'src',
              name: 'src',
              type: 'folder',
              path: 'src',
              isExpanded: true,
              children: [
                {
                  id: 'src/App.tsx',
                  name: 'App.tsx',
                  type: 'file',
                  path: 'src/App.tsx',
                  parentId: 'src',
                  content: createDefaultFileContent('App.tsx'),
                  language: 'typescript',
                  lastModified: new Date()
                },
                {
                  id: 'src/main.tsx',
                  name: 'main.tsx',
                  type: 'file',
                  path: 'src/main.tsx',
                  parentId: 'src',
                  content: createDefaultFileContent('main.tsx'),
                  language: 'typescript',
                  lastModified: new Date()
                },
                {
                  id: 'src/index.css',
                  name: 'index.css',
                  type: 'file',
                  path: 'src/index.css',
                  parentId: 'src',
                  content: createDefaultFileContent('index.css'),
                  language: 'css',
                  lastModified: new Date()
                }
              ]
            },
            {
              id: 'public',
              name: 'public',
              type: 'folder',
              path: 'public',
              children: [
                {
                  id: 'public/index.html',
                  name: 'index.html',
                  type: 'file',
                  path: 'public/index.html',
                  parentId: 'public',
                  content: createDefaultFileContent('index.html'),
                  language: 'html',
                  lastModified: new Date()
                }
              ]
            },
            {
              id: 'package.json',
              name: 'package.json',
              type: 'file',
              path: 'package.json',
              content: createDefaultFileContent('package.json'),
              language: 'json',
              lastModified: new Date()
            },
            {
              id: 'README.md',
              name: 'README.md',
              type: 'file',
              path: 'README.md',
              content: `# ${name}\n\nCreated with VibeStudio - Where Code Meets Flow\n\n## Getting Started\n\nStart editing files in the src folder to build your project.\n\n## Your Creative Code Space\n\nVibeStudio provides a modern development environment with:\n- Monaco Editor with IntelliSense\n- File management\n- Theme switching\n- AI integration (coming soon)\n\nHappy coding! 🚀`,
              language: 'markdown',
              lastModified: new Date()
            }
          ]
        }

        set({ 
          currentProject: project, 
          files: project.files,
          selectedFile: 'src/App.tsx'
        })
      },

      loadProject: (project: ProjectStructure) => {
        set({ 
          currentProject: project, 
          files: project.files,
          selectedFile: null
        })
      },

      saveProject: () => {
        const { currentProject, files } = get()
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            files,
            lastModified: new Date()
          }
          set({ currentProject: updatedProject })
        }
      },

      createFile: (parentPath: string, name: string, isFolder = false) => {
        const validation = validateFileName(name)
        if (!validation.valid) {
          alert(validation.error)
          return null
        }

        const path = generatePath(parentPath, name)
        const { files } = get()
        
        // Check if file already exists
        if (files.some(f => f.path === path)) {
          alert('A file with this name already exists')
          return null
        }

        const newFile: FileSystemItem = {
          id: path,
          name,
          type: isFolder ? 'folder' : 'file',
          path,
          parentId: parentPath || undefined,
          content: isFolder ? undefined : createDefaultFileContent(name),
          language: isFolder ? undefined : getLanguageFromFilename(name),
          lastModified: new Date(),
          children: isFolder ? [] : undefined,
          isExpanded: isFolder ? false : undefined
        }

        // Add to parent's children if parent exists
        const updatedFiles = files.map(file => {
          if (file.path === parentPath && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            }
          }
          return file
        })

        // If no parent (root level), add directly
        if (!parentPath) {
          updatedFiles.push(newFile)
        }

        set({ files: updatedFiles })
        get().saveProject()
        
        return newFile
      },

      deleteFile: (path: string) => {
        const { files } = get()
        
        const deleteRecursive = (items: FileSystemItem[], targetPath: string): FileSystemItem[] => {
          return items.filter(item => {
            if (item.path === targetPath) {
              return false
            }
            if (item.children) {
              item.children = deleteRecursive(item.children, targetPath)
            }
            return true
          })
        }

        const updatedFiles = deleteRecursive(files, path)
        set({ files: updatedFiles, selectedFile: null })
        get().saveProject()
        
        return true
      },

      renameFile: (path: string, newName: string) => {
        const validation = validateFileName(newName)
        if (!validation.valid) {
          alert(validation.error)
          return false
        }

        const { files } = get()
        const parentPath = getParentPath(path)
        const newPath = generatePath(parentPath, newName)

        const renameRecursive = (items: FileSystemItem[]): FileSystemItem[] => {
          return items.map(item => {
            if (item.path === path) {
              return {
                ...item,
                name: newName,
                path: newPath,
                id: newPath
              }
            }
            if (item.children) {
              item.children = renameRecursive(item.children)
            }
            return item
          })
        }

        const updatedFiles = renameRecursive(files)
        set({ files: updatedFiles })
        get().saveProject()
        
        return true
      },

      moveFile: (fromPath: string, toPath: string) => {
        // Implementation for drag & drop file moving
        console.log('Move file from', fromPath, 'to', toPath)
        return true
      },

      updateFileContent: (path: string, content: string) => {
        const { files } = get()
        
        const updateRecursive = (items: FileSystemItem[]): FileSystemItem[] => {
          return items.map(item => {
            if (item.path === path) {
              return {
                ...item,
                content,
                lastModified: new Date(),
                isDirty: true
              }
            }
            if (item.children) {
              item.children = updateRecursive(item.children)
            }
            return item
          })
        }

        const updatedFiles = updateRecursive(files)
        set({ files: updatedFiles })
      },

      toggleFolder: (path: string) => {
        const { expandedFolders } = get()
        const newExpanded = new Set(expandedFolders)
        
        if (newExpanded.has(path)) {
          newExpanded.delete(path)
        } else {
          newExpanded.add(path)
        }
        
        set({ expandedFolders: newExpanded })
      },

      selectFile: (path: string) => {
        set({ selectedFile: path })
      },

      getFile: (path: string) => {
        const { files } = get()
        
        const findRecursive = (items: FileSystemItem[]): FileSystemItem | null => {
          for (const item of items) {
            if (item.path === path) {
              return item
            }
            if (item.children) {
              const found = findRecursive(item.children)
              if (found) return found
            }
          }
          return null
        }
        
        return findRecursive(files)
      },

      getFilesInFolder: (folderPath: string) => {
        const folder = get().getFile(folderPath)
        return folder?.children || []
      },

      searchFiles: (query: string) => {
        const { files } = get()
        const results: FileSystemItem[] = []
        
        const searchRecursive = (items: FileSystemItem[]) => {
          items.forEach(item => {
            if (item.name.toLowerCase().includes(query.toLowerCase())) {
              results.push(item)
            }
            if (item.children) {
              searchRecursive(item.children)
            }
          })
        }
        
        searchRecursive(files)
        return results
      },

      exportProject: () => {
        const { currentProject } = get()
        if (!currentProject) return

        const dataStr = JSON.stringify(currentProject, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `${currentProject.name}.vibestudio`
        link.click()
      },

      importProject: async (files: File[]) => {
        // Implementation for importing files
        console.log('Import project files:', files)
      }
    }),
    {
      name: 'vibestudio-filesystem',
      partialize: (state) => ({
        currentProject: state.currentProject,
        files: state.files,
        expandedFolders: Array.from(state.expandedFolders),
        selectedFile: state.selectedFile
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.expandedFolders)) {
          state.expandedFolders = new Set(state.expandedFolders)
        }
      }
    }
  )
)
