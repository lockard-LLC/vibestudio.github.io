// Production-Grade File Explorer Component
import React, { useState, useEffect, useRef } from 'react'
import { 
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  Plus, RefreshCw, Search, Edit3, Trash2,
  FileText, FolderPlus, Copy, Filter
} from 'lucide-react'
import FileSystemService, { FileSystemItem } from '../../shared/services/FileSystemService'
import CollapsibleSection from '../../shared/components/CollapsibleSection'

interface FileExplorerProps {
  onFileSelect?: (file: FileSystemItem) => void
  onFileOpen?: (file: FileSystemItem) => void
}

interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  item: FileSystemItem | null
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  onFileSelect, 
  onFileOpen 
}) => {
  const [fileTree, setFileTree] = useState<FileSystemItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    item: null
  })
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [, setCurrentPath] = useState('')
  
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const fileExplorerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFileTree()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ isOpen: false, x: 0, y: 0, item: null })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadFileTree = async () => {
    try {
      setLoading(true)
      const cwd = await FileSystemService.getCurrentWorkingDirectory()
      setCurrentPath(cwd)
      const files = await FileSystemService.readDirectory(cwd)
      setFileTree(files)
      
      // Auto-expand src folder
      if (files.some(f => f.name === 'src' && f.type === 'directory')) {
        setExpandedFolders(prev => new Set(prev).add(`${cwd}/src`))
      }
    } catch (error) {
      console.error('Failed to load file tree:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDirectory = async (path: string): Promise<FileSystemItem[]> => {
    try {
      return await FileSystemService.readDirectory(path)
    } catch (error) {
      console.error('Failed to load directory:', error)
      return []
    }
  }

  const toggleFolder = async (item: FileSystemItem) => {
    const isExpanded = expandedFolders.has(item.path)
    const newExpanded = new Set(expandedFolders)
    
    if (isExpanded) {
      newExpanded.delete(item.path)
    } else {
      newExpanded.add(item.path)
      
      // Load children if not already loaded
      if (!item.children) {
        const children = await loadDirectory(item.path)
        setFileTree(prevTree => updateTreeWithChildren(prevTree, item.path, children))
      }
    }
    
    setExpandedFolders(newExpanded)
  }

  const updateTreeWithChildren = (
    tree: FileSystemItem[], 
    targetPath: string, 
    children: FileSystemItem[]
  ): FileSystemItem[] => {
    return tree.map(item => {
      if (item.path === targetPath) {
        return { ...item, children }
      } else if (item.children && item.type === 'directory') {
        return { 
          ...item, 
          children: updateTreeWithChildren(item.children, targetPath, children) 
        }
      }
      return item
    })
  }

  const handleFileClick = (item: FileSystemItem, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (item.type === 'directory') {
      toggleFolder(item)
    } else {
      setSelectedFile(item.path)
      onFileSelect?.(item)
      
      // Double click to open
      if (event.detail === 2) {
        onFileOpen?.(item)
      }
    }
  }

  const handleContextMenu = (event: React.MouseEvent, item: FileSystemItem) => {
    event.preventDefault()
    event.stopPropagation()
    
    setContextMenu({
      isOpen: true,
      x: event.clientX,
      y: event.clientY,
      item
    })
  }

  const handleContextMenuAction = async (action: string, item: FileSystemItem) => {
    setContextMenu({ isOpen: false, x: 0, y: 0, item: null })
    
    switch (action) {
      case 'rename':
        setEditingItem(item.path)
        setNewItemName(item.name)
        break
      case 'delete':
        if (confirm(`Delete ${item.name}?`)) {
          try {
            await FileSystemService.deleteFile(item.path)
            await loadFileTree()
          } catch (error) {
            console.error('Failed to delete file:', error)
          }
        }
        break
      case 'copy':
        // Implement copy functionality
        navigator.clipboard.writeText(item.path)
        break
      case 'new-file':
        // Implement new file creation
        break
      case 'new-folder':
        // Implement new folder creation
        break
    }
  }

  const handleRename = async () => {
    if (!editingItem || !newItemName.trim()) return
    
    try {
      // TODO: Implementation would depend on file system API
      // Rename functionality placeholder
      setEditingItem(null)
      setNewItemName('')
      await loadFileTree()
    } catch (error) {
      console.error('Failed to rename:', error)
    }
  }

  const filterItems = (items: FileSystemItem[]): FileSystemItem[] => {
    if (!searchQuery.trim()) return items
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.children && filterItems(item.children).length > 0)
    ).map(item => ({
      ...item,
      children: item.children ? filterItems(item.children) : undefined
    }))
  }

  const renderFileItem = (item: FileSystemItem, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(item.path)
    const isSelected = selectedFile === item.path
    const isEditing = editingItem === item.path
    const paddingLeft = depth * 16 + 8
    
    const fileIcon = item.type === 'directory' 
      ? (isExpanded ? FolderOpen : Folder)
      : File

    return (
      <div key={item.path}>
        <div
          className={`
            flex items-center py-1 px-2 hover:bg-hover cursor-pointer 
            transition-all duration-150 group rounded-md mx-1
            ${isSelected ? 'bg-accent/20 border border-accent/30' : ''}
          `}
          style={{ paddingLeft }}
          onClick={(e) => handleFileClick(item, e)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          {/* Expand/Collapse Icon */}
          {item.type === 'directory' && (
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              {isExpanded ? (
                <ChevronDown size={12} className="text-text-secondary" />
              ) : (
                <ChevronRight size={12} className="text-text-secondary" />
              )}
            </div>
          )}
          
          {/* File/Folder Icon */}
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            {React.createElement(fileIcon, {
              size: 16,
              className: `
                ${item.type === 'directory' 
                  ? (isExpanded ? 'text-accent' : 'text-warning') 
                  : 'text-info'
                }
              `
            })}
          </div>
          
          {/* File Name */}
          {isEditing ? (
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setEditingItem(null)
                  setNewItemName('')
                }
              }}
              className="
                flex-1 bg-secondary border border-border rounded px-1 py-0.5
                text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent
              "
              autoFocus
            />
          ) : (
            <span className={`
              flex-1 text-sm font-medium truncate
              ${isSelected ? 'text-accent' : 'text-text-primary'}
            `}>
              {item.name}
            </span>
          )}
          
          {/* File Size and Extension */}
          {item.type === 'file' && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.extension && (
                <span className="text-xs text-text-muted font-mono">
                  {FileSystemService.getFileIcon(item.extension)}
                </span>
              )}
              {item.size && (
                <span className="text-xs text-text-muted">
                  {formatFileSize(item.size)}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Children */}
        {item.type === 'directory' && isExpanded && item.children && (
          <div className="transition-all duration-200">
            {item.children
              .sort((a, b) => {
                // Directories first, then files
                if (a.type !== b.type) {
                  return a.type === 'directory' ? -1 : 1
                }
                return a.name.localeCompare(b.name)
              })
              .map(child => renderFileItem(child, depth + 1))
            }
          </div>
        )}
      </div>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const filteredFileTree = filterItems(fileTree)

  // Organize files by type for collapsible sections
  const organizedFiles = filteredFileTree.reduce((acc, item) => {
    if (item.type === 'directory') {
      acc.folders.push(item)
    } else {
      const ext = item.extension?.toLowerCase()
      if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) {
        acc.source.push(item)
      } else if (['json', 'md', 'txt', 'yml', 'yaml'].includes(ext || '')) {
        acc.config.push(item)
      } else {
        acc.other.push(item)
      }
    }
    return acc
  }, { folders: [] as FileSystemItem[], source: [] as FileSystemItem[], config: [] as FileSystemItem[], other: [] as FileSystemItem[] })

  return (
    <div ref={fileExplorerRef} className="h-full flex flex-col">
      {/* Quick Search */}
      <CollapsibleSection
        title="Quick Search"
        icon={Search}
        defaultExpanded={false}
        storageKey="file-explorer-search"
        className="border-b-0"
      >
        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500/60" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2.5 
                bg-gradient-to-r from-white/80 to-blue-50/60
                dark:from-slate-800/80 dark:to-blue-950/40
                border border-blue-200/60 dark:border-blue-700/60
                rounded-xl text-sm text-slate-700 dark:text-slate-300
                placeholder-blue-400/60 dark:placeholder-blue-500/60
                focus:outline-none focus:ring-2 focus:ring-blue-400/50 
                focus:border-blue-400/80 focus:bg-white dark:focus:bg-slate-800
                transition-all duration-300 shadow-sm
                backdrop-blur-sm
              "
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Project Files */}
      <CollapsibleSection
        title="Project Files"
        icon={Folder}
        badge={fileTree.length}
        defaultExpanded={true}
        storageKey="file-explorer-project"
        actions={
          <div className="flex items-center space-x-1">
            <button
              onClick={loadFileTree}
              className="
                w-7 h-7 flex items-center justify-center rounded-lg
                bg-blue-100/60 hover:bg-blue-200/80 dark:bg-blue-900/40 dark:hover:bg-blue-800/60
                border border-blue-200/60 dark:border-blue-700/60
                transition-all duration-300 hover:scale-110 hover:shadow-sm
                group
              "
              title="Refresh"
            >
              <RefreshCw size={12} className="text-blue-600 dark:text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              className="
                w-7 h-7 flex items-center justify-center rounded-lg
                bg-green-100/60 hover:bg-green-200/80 dark:bg-green-900/40 dark:hover:bg-green-800/60
                border border-green-200/60 dark:border-green-700/60
                transition-all duration-300 hover:scale-110 hover:shadow-sm
                group
              "
              title="New File"
            >
              <Plus size={12} className="text-green-600 dark:text-green-400 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        }
      >
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <RefreshCw size={16} className="animate-spin text-text-muted" />
              <span className="ml-2 text-sm text-text-muted">Loading...</span>
            </div>
          ) : filteredFileTree.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <span className="text-sm text-text-muted">No files found</span>
            </div>
          ) : (
            <div className="pb-4 space-y-1 px-2">
              {filteredFileTree.map(item => renderFileItem(item))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Folders */}
      {organizedFiles.folders.length > 0 && (
        <CollapsibleSection
          title="Directories"
          icon={FolderOpen}
          badge={organizedFiles.folders.length}
          defaultExpanded={true}
          storageKey="file-explorer-folders"
        >
          <div className="overflow-y-auto max-h-64 px-2">
            {organizedFiles.folders.map(item => renderFileItem(item))}
          </div>
        </CollapsibleSection>
      )}

      {/* Source Files */}
      {organizedFiles.source.length > 0 && (
        <CollapsibleSection
          title="Source Files"
          icon={File}
          badge={organizedFiles.source.length}
          defaultExpanded={true}
          storageKey="file-explorer-source"
        >
          <div className="overflow-y-auto max-h-64 px-2">
            {organizedFiles.source.map(item => renderFileItem(item))}
          </div>
        </CollapsibleSection>
      )}

      {/* Configuration Files */}
      {organizedFiles.config.length > 0 && (
        <CollapsibleSection
          title="Configuration"
          icon={Filter}
          badge={organizedFiles.config.length}
          defaultExpanded={false}
          storageKey="file-explorer-config"
        >
          <div className="overflow-y-auto max-h-48 px-2">
            {organizedFiles.config.map(item => renderFileItem(item))}
          </div>
        </CollapsibleSection>
      )}

      {/* Other Files */}
      {organizedFiles.other.length > 0 && (
        <CollapsibleSection
          title="Other Files"
          icon={FileText}
          badge={organizedFiles.other.length}
          defaultExpanded={false}
          storageKey="file-explorer-other"
        >
          <div className="overflow-y-auto max-h-48 px-2">
            {organizedFiles.other.map(item => renderFileItem(item))}
          </div>
        </CollapsibleSection>
      )}

      {/* Context Menu */}
      {contextMenu.isOpen && contextMenu.item && (
        <div
          ref={contextMenuRef}
          className="
            fixed z-50 bg-primary border border-border rounded-lg shadow-lg
            min-w-48 py-2
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <div
            className="flex items-center px-3 py-2 hover:bg-hover cursor-pointer transition-colors"
            onClick={() => handleContextMenuAction('rename', contextMenu.item!)}
          >
            <Edit3 size={14} className="mr-3 text-text-secondary" />
            <span className="text-sm text-text-primary">Rename</span>
          </div>
          
          <div
            className="flex items-center px-3 py-2 hover:bg-hover cursor-pointer transition-colors"
            onClick={() => handleContextMenuAction('copy', contextMenu.item!)}
          >
            <Copy size={14} className="mr-3 text-text-secondary" />
            <span className="text-sm text-text-primary">Copy Path</span>
          </div>
          
          <div className="border-t border-border my-1" />
          
          <div
            className="flex items-center px-3 py-2 hover:bg-hover cursor-pointer transition-colors"
            onClick={() => handleContextMenuAction('new-file', contextMenu.item!)}
          >
            <FileText size={14} className="mr-3 text-text-secondary" />
            <span className="text-sm text-text-primary">New File</span>
          </div>
          
          <div
            className="flex items-center px-3 py-2 hover:bg-hover cursor-pointer transition-colors"
            onClick={() => handleContextMenuAction('new-folder', contextMenu.item!)}
          >
            <FolderPlus size={14} className="mr-3 text-text-secondary" />
            <span className="text-sm text-text-primary">New Folder</span>
          </div>
          
          <div className="border-t border-border my-1" />
          
          <div
            className="flex items-center px-3 py-2 hover:bg-error/10 cursor-pointer transition-colors text-error"
            onClick={() => handleContextMenuAction('delete', contextMenu.item!)}
          >
            <Trash2 size={14} className="mr-3" />
            <span className="text-sm">Delete</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileExplorer