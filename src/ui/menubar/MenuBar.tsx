// Top Menu Bar Component with File, Edit, Terminal, Help menus
import React, { useState, useRef, useEffect } from 'react'
import { 
  File, FolderPlus, FileText, Save, SaveAll, RotateCcw,
  Copy, Search, Replace, Settings,
  Terminal, Play, Square, RefreshCw,
  Info, BookOpen, Keyboard,
  ChevronDown, type LucideIcon
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon?: LucideIcon
  shortcut?: string
  action?: () => void
  separator?: boolean
  submenu?: MenuItem[]
}

interface MenuBarProps {
  onAction?: (actionId: string, params?: unknown) => void
}

export const MenuBar: React.FC<MenuBarProps> = ({ onAction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
        setOpenSubmenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = (actionId: string, params?: unknown) => {
    // Menu action: ${actionId}
    void params
    onAction?.(actionId, params)
    setActiveMenu(null)
    setOpenSubmenu(null)
  }

  const fileMenu: MenuItem[] = [
    {
      id: 'new-file',
      label: 'New File',
      icon: FileText,
      shortcut: 'Ctrl+N',
      action: () => handleAction('new-file')
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: FolderPlus,
      shortcut: 'Ctrl+Shift+N',
      action: () => handleAction('new-folder')
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'open-file',
      label: 'Open File...',
      icon: File,
      shortcut: 'Ctrl+O',
      action: () => handleAction('open-file')
    },
    {
      id: 'open-folder',
      label: 'Open Folder...',
      icon: FolderPlus,
      shortcut: 'Ctrl+K Ctrl+O',
      action: () => handleAction('open-folder')
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'save',
      label: 'Save',
      icon: Save,
      shortcut: 'Ctrl+S',
      action: () => handleAction('save')
    },
    {
      id: 'save-as',
      label: 'Save As...',
      shortcut: 'Ctrl+Shift+S',
      action: () => handleAction('save-as')
    },
    {
      id: 'save-all',
      label: 'Save All',
      icon: SaveAll,
      shortcut: 'Ctrl+K S',
      action: () => handleAction('save-all')
    },
    { id: 'sep3', label: '', separator: true },
    {
      id: 'revert',
      label: 'Revert File',
      icon: RotateCcw,
      action: () => handleAction('revert-file')
    },
    { id: 'sep4', label: '', separator: true },
    {
      id: 'close-file',
      label: 'Close File',
      shortcut: 'Ctrl+W',
      action: () => handleAction('close-file')
    },
    {
      id: 'close-all',
      label: 'Close All',
      shortcut: 'Ctrl+K Ctrl+W',
      action: () => handleAction('close-all')
    }
  ]

  const editMenu: MenuItem[] = [
    {
      id: 'undo',
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: () => handleAction('undo')
    },
    {
      id: 'redo',
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      action: () => handleAction('redo')
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'cut',
      label: 'Cut',
      shortcut: 'Ctrl+X',
      action: () => handleAction('cut')
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      shortcut: 'Ctrl+C',
      action: () => handleAction('copy')
    },
    {
      id: 'paste',
      label: 'Paste',
      shortcut: 'Ctrl+V',
      action: () => handleAction('paste')
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'find',
      label: 'Find',
      icon: Search,
      shortcut: 'Ctrl+F',
      action: () => handleAction('find')
    },
    {
      id: 'replace',
      label: 'Replace',
      icon: Replace,
      shortcut: 'Ctrl+H',
      action: () => handleAction('replace')
    },
    {
      id: 'find-in-files',
      label: 'Find in Files',
      shortcut: 'Ctrl+Shift+F',
      action: () => handleAction('find-in-files')
    },
    { id: 'sep3', label: '', separator: true },
    {
      id: 'select-all',
      label: 'Select All',
      shortcut: 'Ctrl+A',
      action: () => handleAction('select-all')
    },
    { id: 'sep4', label: '', separator: true },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Settings,
      shortcut: 'Ctrl+,',
      action: () => handleAction('preferences')
    }
  ]

  const terminalMenu: MenuItem[] = [
    {
      id: 'new-terminal',
      label: 'New Terminal',
      icon: Terminal,
      shortcut: 'Ctrl+Shift+`',
      action: () => handleAction('new-terminal')
    },
    {
      id: 'split-terminal',
      label: 'Split Terminal',
      shortcut: 'Ctrl+Shift+5',
      action: () => handleAction('split-terminal')
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'run-task',
      label: 'Run Task...',
      icon: Play,
      shortcut: 'Ctrl+Shift+P',
      action: () => handleAction('run-task')
    },
    {
      id: 'run-build',
      label: 'Run Build Task',
      shortcut: 'Ctrl+Shift+B',
      action: () => handleAction('run-build')
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'clear-terminal',
      label: 'Clear Terminal',
      action: () => handleAction('clear-terminal')
    },
    {
      id: 'kill-terminal',
      label: 'Kill Terminal',
      icon: Square,
      action: () => handleAction('kill-terminal')
    }
  ]

  const helpMenu: MenuItem[] = [
    {
      id: 'welcome',
      label: 'Welcome',
      action: () => handleAction('welcome')
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: BookOpen,
      action: () => handleAction('documentation')
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'keyboard-shortcuts',
      label: 'Keyboard Shortcuts',
      icon: Keyboard,
      shortcut: 'Ctrl+K Ctrl+S',
      action: () => handleAction('keyboard-shortcuts')
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'check-updates',
      label: 'Check for Updates...',
      icon: RefreshCw,
      action: () => handleAction('check-updates')
    },
    { id: 'sep3', label: '', separator: true },
    {
      id: 'about',
      label: 'About VibeStudio',
      icon: Info,
      action: () => handleAction('about')
    }
  ]

  const menuItems = [
    { id: 'file', label: 'File', menu: fileMenu },
    { id: 'edit', label: 'Edit', menu: editMenu },
    { id: 'terminal', label: 'Terminal', menu: terminalMenu },
    { id: 'help', label: 'Help', menu: helpMenu }
  ]

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (item.separator) {
      return <div key={item.id} className="border-t border-border my-1" />
    }

    const Icon = item.icon
    const hasSubmenu = item.submenu && item.submenu.length > 0

    return (
      <div
        key={item.id}
        className={`
          flex items-center justify-between px-3 py-2 text-sm
          hover:bg-hover cursor-pointer transition-all duration-150
          ${depth > 0 ? 'pl-6' : ''}
          group
        `}
        onClick={() => {
          if (hasSubmenu) {
            setOpenSubmenu(openSubmenu === item.id ? null : item.id)
          } else {
            item.action?.()
          }
        }}
        onMouseEnter={() => {
          if (hasSubmenu) {
            setOpenSubmenu(item.id)
          }
        }}
      >
        <div className="flex items-center space-x-3 flex-1">
          {Icon && (
            <Icon size={16} className="text-text-secondary group-hover:text-text-primary" />
          )}
          <span className="text-text-primary group-hover:text-accent font-medium">
            {item.label}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {item.shortcut && (
            <span className="text-xs text-text-muted font-mono">
              {item.shortcut}
            </span>
          )}
          {hasSubmenu && (
            <ChevronDown 
              size={12} 
              className={`
                text-text-secondary transform transition-transform duration-200
                ${openSubmenu === item.id ? 'rotate-180' : ''}
              `}
            />
          )}
        </div>

        {/* Submenu */}
        {hasSubmenu && openSubmenu === item.id && item.submenu && (
          <div className="absolute left-full top-0 ml-1 z-50">
            <div className="
              bg-primary border border-border rounded-lg shadow-lg
              min-w-48 py-2 
              animate-in fade-in slide-in-from-left-2 duration-200
            ">
              {item.submenu.map(subItem => renderMenuItem(subItem, depth + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={menuRef}
      className="
        h-8 bg-secondary border-b border-border flex items-center
        text-sm font-medium select-none relative z-40
      "
    >
      {/* Menu Items */}
      <div className="flex items-center">
        {menuItems.map(({ id, label, menu }) => (
          <div key={id} className="relative">
            <button
              className={`
                px-3 py-1 rounded-md transition-all duration-150
                hover:bg-hover focus:outline-none
                ${activeMenu === id 
                  ? 'bg-hover text-accent' 
                  : 'text-text-primary hover:text-accent'
                }
              `}
              onClick={() => {
                setActiveMenu(activeMenu === id ? null : id)
                setOpenSubmenu(null)
              }}
              onMouseEnter={() => {
                if (activeMenu) {
                  setActiveMenu(id)
                  setOpenSubmenu(null)
                }
              }}
            >
              {label}
            </button>

            {/* Dropdown Menu */}
            {activeMenu === id && (
              <div className="
                absolute top-full left-0 mt-1 z-50
                bg-primary border border-border rounded-lg shadow-lg
                min-w-64 py-2
                animate-in fade-in slide-in-from-top-2 duration-200
              ">
                {menu.map(item => renderMenuItem(item))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Window Controls Spacer */}
      <div className="flex-1" />

      {/* Window Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-text-secondary text-xs font-medium">
          VibeStudio - Modern IDE Experience
        </span>
      </div>

      {/* Right side - could add window controls for desktop app */}
      <div className="flex items-center space-x-1 px-2">
        {/* Placeholder for window controls */}
      </div>
    </div>
  )
}

export default MenuBar