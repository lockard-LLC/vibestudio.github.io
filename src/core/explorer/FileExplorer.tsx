// src/core/explorer/FileExplorer.tsx
import React, { useState, useRef } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  Plus, 
  Search,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload
} from 'lucide-react'
import { useFileSystemStore } from '../../shared/stores/fileSystemStore'
import { FileSystemItem } from '../../shared/types/fileSystem'
import { getFileIcon, formatFileSize } from '../../shared/utils/fileUtils'

export const FileExplorer: React.FC = () => {
  const {
    files,
    expandedFolders,
    selectedFile,
    currentProject,
    createFile,
    deleteFile,
    renameFile,
    toggleFolder,
    selectFile,
    searchFiles,
    createProject,
    exportProject
  } = useFileSystemStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    item: FileSystemItem | null
  } | null>(null)
  const [renamingItem, setRenamingItem] = useState<string | null>(null)
  const [newItemParent, setNewItemParent] = useState<string | null>(null)
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create default project if none exists
  React.useEffect(() => {
    if (!currentProject && files.length === 0) {
      createProject('My VibeStudio Project')
    }
  }, [currentProject, files.length, createProject])

  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    })
  }

  const handleCreateFile = (parentPath: string, isFolder: boolean) => {
    setNewItemParent(parentPath)
    setNewItemType(isFolder ? 'folder' : 'file')
  }

  const handleRename = (item: FileSystemItem) => {
    setRenamingItem(item.path)
    setContextMenu(null)
  }

  const handleDelete = (item: FileSystemItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteFile(item.path)
    }
    setContextMenu(null)
  }

  const handleRenameSubmit = (path: string, newName: string) => {
    if (newName.trim() && newName !== getFileName(path)) {
      renameFile(path, newName.trim())
    }
    setRenamingItem(null)
  }

  const handleNewItemSubmit = (name: string) => {
    if (name.trim() && newItemParent !== null) {
      createFile(newItemParent, name.trim(), newItemType === 'folder')
    }
    setNewItemParent(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // Implementation for file upload
    console.log('Upload files:', files)
  }

  const filteredFiles = searchQuery 
    ? searchFiles(searchQuery)
    : files

  const getFileName = (path: string) => path.split('/').pop() || ''

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="h-full flex flex-col bg-primary">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-primary">
            {currentProject?.name || 'Explorer'}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCreateFile('', false)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              title="New File"
            >
              <Plus size={14} className="text-text-secondary" />
            </button>
            <button
              onClick={() => handleCreateFile('', true)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              title="New Folder"
            >
              <Folder size={14} className="text-text-secondary" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              title="Upload Files"
            >
              <Upload size={14} className="text-text-secondary" />
            </button>
            <button
              onClick={exportProject}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              title="Export Project"
            >
              <Download size={14} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-text-muted text-sm">
              {searchQuery ? 'No files found' : 'No files in project'}
            </div>
            {!searchQuery && (
              <button
                onClick={() => handleCreateFile('', false)}
                className="mt-2 text-accent text-sm hover:underline"
              >
                Create your first file
              </button>
            )}
          </div>
        ) : (
          <FileTree
            items={filteredFiles}
            expandedFolders={expandedFolders}
            selectedFile={selectedFile}
            onToggleFolder={toggleFolder}
            onSelectFile={selectFile}
            onContextMenu={handleContextMenu}
            renamingItem={renamingItem}
            onRenameSubmit={handleRenameSubmit}
            newItemParent={newItemParent}
            newItemType={newItemType}
            onNewItemSubmit={handleNewItemSubmit}
            onCreateFile={handleCreateFile}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onRename={handleRename}
          onDelete={handleDelete}
          onCreateFile={handleCreateFile}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  )
}

interface FileTreeProps {
  items: FileSystemItem[]
  expandedFolders: Set<string>
  selectedFile: string | null
  onToggleFolder: (path: string) => void
  onSelectFile: (path: string) => void
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void
  renamingItem: string | null
  onRenameSubmit: (path: string, newName: string) => void
  newItemParent: string | null
  newItemType: 'file' | 'folder'
  onNewItemSubmit: (name: string) => void
  onCreateFile: (parentPath: string, isFolder: boolean) => void
}

const FileTree: React.FC<FileTreeProps> = ({
  items,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onSelectFile,
  onContextMenu,
  renamingItem,
  onRenameSubmit,
  newItemParent,
  newItemType,
  onNewItemSubmit,
  onCreateFile: _
}) => {
  const renderItem = (item: FileSystemItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.path)
    const isSelected = selectedFile === item.path
    const isRenaming = renamingItem === item.path
    const paddingLeft = depth * 12 + 8

    return (
      <div key={item.path}>
        <FileItem
          item={item}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isRenaming={isRenaming}
          paddingLeft={paddingLeft}
          onToggleFolder={onToggleFolder}
          onSelectFile={onSelectFile}
          onContextMenu={onContextMenu}
          onRenameSubmit={onRenameSubmit}
        />

        {/* New item input */}
        {newItemParent === item.path && (
          <NewItemInput
            type={newItemType}
            paddingLeft={paddingLeft + 16}
            onSubmit={onNewItemSubmit}
            onCancel={() => onNewItemSubmit('')}
          />
        )}

        {/* Children */}
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="select-none">
      {/* Root level new item */}
      {newItemParent === '' && (
        <NewItemInput
          type={newItemType}
          paddingLeft={8}
          onSubmit={onNewItemSubmit}
          onCancel={() => onNewItemSubmit('')}
        />
      )}
      {items.map(item => renderItem(item))}
    </div>
  )
}

interface FileItemProps {
  item: FileSystemItem
  isExpanded: boolean
  isSelected: boolean
  isRenaming: boolean
  paddingLeft: number
  onToggleFolder: (path: string) => void
  onSelectFile: (path: string) => void
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void
  onRenameSubmit: (path: string, newName: string) => void
}

const FileItem: React.FC<FileItemProps> = ({
  item,
  isExpanded,
  isSelected,
  isRenaming,
  paddingLeft,
  onToggleFolder,
  onSelectFile,
  onContextMenu,
  onRenameSubmit
}) => {
  const [renameValue, setRenameValue] = useState(item.name)

  const handleClick = () => {
    if (item.type === 'folder') {
      onToggleFolder(item.path)
    } else {
      onSelectFile(item.path)
    }
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameSubmit(item.path, renameValue)
    } else if (e.key === 'Escape') {
      onRenameSubmit(item.path, item.name) // Cancel
    }
  }

  React.useEffect(() => {
    setRenameValue(item.name)
  }, [item.name])

  return (
    <div
      className={`
        flex items-center py-1 px-2 hover:bg-secondary cursor-pointer
        text-sm transition-colors group
        ${isSelected ? 'bg-accent/20 text-accent' : 'text-text-primary'}
      `}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, item)}
    >
      {/* Expand/Collapse Icon */}
      {item.type === 'folder' && (
        <div className="w-4 flex items-center justify-center mr-1">
          {isExpanded ? (
            <ChevronDown size={14} className="text-text-secondary" />
          ) : (
            <ChevronRight size={14} className="text-text-secondary" />
          )}
        </div>
      )}

      {/* File/Folder Icon */}
      <div className="mr-2 text-base leading-none">
        {item.type === 'folder' ? '📁' : getFileIcon(item.name)}
      </div>

      {/* Name */}
      {isRenaming ? (
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={() => onRenameSubmit(item.path, renameValue)}
          onKeyDown={handleRenameKeyDown}
          className="flex-1 bg-secondary border border-accent rounded px-1 text-sm focus:outline-none"
          autoFocus
        />
      ) : (
        <span className="flex-1 truncate">{item.name}</span>
      )}

      {/* File info */}
      {item.type === 'file' && item.size && (
        <span className="text-xs text-text-muted ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatFileSize(item.size)}
        </span>
      )}

      {/* Dirty indicator */}
      {item.isDirty && (
        <div className="w-2 h-2 bg-accent rounded-full ml-2" />
      )}
    </div>
  )
}

interface NewItemInputProps {
  type: 'file' | 'folder'
  paddingLeft: number
  onSubmit: (name: string) => void
  onCancel: () => void
}

const NewItemInput: React.FC<NewItemInputProps> = ({
  type,
  paddingLeft,
  onSubmit,
  onCancel
}) => {
  const [value, setValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit(value)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      className="flex items-center py-1 px-2 text-sm"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <div className="mr-2 text-base leading-none">
        {type === 'folder' ? '📁' : '📄'}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSubmit(value)}
        onKeyDown={handleKeyDown}
        placeholder={`New ${type} name...`}
        className="flex-1 bg-secondary border border-accent rounded px-2 py-1 text-sm focus:outline-none"
        autoFocus
      />
    </div>
  )
}

interface ContextMenuProps {
  x: number
  y: number
  item: FileSystemItem | null
  onRename: (item: FileSystemItem) => void
  onDelete: (item: FileSystemItem) => void
  onCreateFile: (parentPath: string, isFolder: boolean) => void
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onRename,
  onDelete,
  onCreateFile,
  onClose
}) => {
  if (!item) return null

  const menuItems = [
    ...(item.type === 'folder' ? [
      {
        label: 'New File',
        icon: File,
        action: () => onCreateFile(item.path, false)
      },
      {
        label: 'New Folder',
        icon: Folder,
        action: () => onCreateFile(item.path, true)
      },
      { type: 'separator' }
    ] : []),
    {
      label: 'Rename',
      icon: Edit3,
      action: () => onRename(item)
    },
    {
      label: 'Copy',
      icon: Copy,
      action: () => console.log('Copy', item.path)
    },
    { type: 'separator' },
    {
      label: 'Delete',
      icon: Trash2,
      action: () => onDelete(item),
      danger: true
    }
  ]

  return (
    <div
      className="fixed bg-primary border border-border rounded-lg shadow-lg py-1 z-50 min-w-48"
      style={{ left: x, top: y }}
      onClick={onClose}
    >
      {menuItems.map((menuItem, index) => {
        if (menuItem.type === 'separator') {
          return <div key={index} className="border-t border-border my-1" />
        }

        const Icon = menuItem.icon
        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              menuItem.action?.()
              onClose()
            }}
            className={`
              w-full flex items-center px-3 py-2 text-sm hover:bg-secondary transition-colors text-left
              ${menuItem.danger ? 'text-error hover:bg-error/10' : 'text-text-primary'}
            `}
          >
            {Icon && <Icon size={14} className="mr-3" />}
            {menuItem.label}
          </button>
        )
      })}
    </div>
  )
}
