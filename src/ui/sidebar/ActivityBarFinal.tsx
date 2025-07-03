// Final Clean ActivityBar with Fully Clickable Tabs
import React, { useState, useCallback } from 'react'
import { 
  Files, 
  Search, 
  GitBranch, 
  Puzzle, 
  Settings,
  MessageSquare,
  Menu,
  Terminal,
  Database,
  Globe,
  Zap,
  Code,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  Bug
} from 'lucide-react'

interface Activity {
  id: string
  icon: LucideIcon
  label: string
  category: 'core' | 'plugin'
  order: number
  description?: string
}

interface ActivityBarProps {
  activeView: string
  onViewChange: (view: string) => void
  onToggleSidebar: () => void
  sidebarMerged?: boolean
  onUnmergeSidebar?: () => void
}

export const ActivityBarFinal: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  onToggleSidebar,
  sidebarMerged = false,
  onUnmergeSidebar
}) => {
  // All activities are enabled and clickable
  const defaultActivities: Activity[] = [
    { 
      id: 'explorer', 
      icon: Files, 
      label: 'Explorer', 
      category: 'core', 
      order: 0,
      description: 'Browse files and folders'
    },
    { 
      id: 'search', 
      icon: Search, 
      label: 'Search', 
      category: 'core', 
      order: 1,
      description: 'Search across files'
    },
    { 
      id: 'git', 
      icon: GitBranch, 
      label: 'Source Control', 
      category: 'core', 
      order: 2,
      description: 'Git version control'
    },
    { 
      id: 'debug', 
      icon: Bug, 
      label: 'Run and Debug', 
      category: 'core', 
      order: 3,
      description: 'Debug your applications'
    },
    { 
      id: 'terminal', 
      icon: Terminal, 
      label: 'Terminal', 
      category: 'plugin', 
      order: 4,
      description: 'Integrated terminal'
    },
    { 
      id: 'database', 
      icon: Database, 
      label: 'Database', 
      category: 'plugin', 
      order: 5,
      description: 'Database connections'
    },
    { 
      id: 'web', 
      icon: Globe, 
      label: 'Live Server', 
      category: 'plugin', 
      order: 6,
      description: 'Web development server'
    },
    { 
      id: 'ai', 
      icon: MessageSquare, 
      label: 'AI Assistant', 
      category: 'plugin', 
      order: 7,
      description: 'AI coding assistance'
    },
    { 
      id: 'performance', 
      icon: Zap, 
      label: 'Performance', 
      category: 'plugin', 
      order: 8,
      description: 'Performance monitoring'
    },
    { 
      id: 'snippets', 
      icon: Code, 
      label: 'Snippets', 
      category: 'plugin', 
      order: 9,
      description: 'Code snippets library'
    },
    { 
      id: 'extensions', 
      icon: Puzzle, 
      label: 'Extensions', 
      category: 'core', 
      order: 10,
      description: 'Manage extensions'
    },
  ]

  const [activities, setActivities] = useState<Activity[]>(defaultActivities)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Save activity order to localStorage
  const saveActivityOrder = useCallback((newActivities: Activity[]) => {
    try {
      localStorage.setItem('vibestudio-activity-order', JSON.stringify(newActivities))
    } catch (error) {
      console.warn('Failed to save activity order:', error)
    }
  }, [])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    setDraggedItem(activityId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', activityId)
  }

  const handleDragOver = (e: React.DragEvent, activityId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem(activityId)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = activities.findIndex(a => a.id === draggedItem)
    const targetIndex = activities.findIndex(a => a.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newActivities = [...activities]
    const [draggedActivity] = newActivities.splice(draggedIndex, 1)
    newActivities.splice(targetIndex, 0, draggedActivity)

    const reorderedActivities = newActivities.map((activity, index) => ({
      ...activity,
      order: index
    }))

    setActivities(reorderedActivities)
    saveActivityOrder(reorderedActivities)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Toggle collapse with smooth animation
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Handle activity click with merge/unmerge functionality
  const handleActivityClick = (activity: Activity) => {
    if (sidebarMerged && activeView === activity.id) {
      // If sidebar is merged and clicking the active view, unmerge it
      onUnmergeSidebar?.()
    } else {
      // Normal view change
      onViewChange(activity.id)
      
      // If sidebar is merged, unmerge it when switching views
      if (sidebarMerged) {
        onUnmergeSidebar?.()
      }
    }
  }

  return (
    <div 
      className={`
        bg-secondary border-r border-border flex flex-col
        transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        ${isCollapsed ? 'w-12' : 'w-48'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border h-12">
        <button
          onClick={onToggleSidebar}
          className="
            w-8 h-8 flex items-center justify-center rounded-lg
            hover:bg-hover transition-all duration-200
            transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-accent/50
          "
          title="Toggle Sidebar"
        >
          <Menu size={16} className="text-text-secondary" />
        </button>
        
        <button
          onClick={toggleCollapse}
          className="
            w-8 h-8 flex items-center justify-center rounded-lg
            hover:bg-hover transition-all duration-200
            transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-accent/50
          "
          title={isCollapsed ? "Expand Activity Bar" : "Collapse Activity Bar"}
        >
          {isCollapsed ? (
            <ChevronRight size={14} className="text-text-secondary" />
          ) : (
            <ChevronLeft size={14} className="text-text-secondary" />
          )}
        </button>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-1">
          {activities
            .sort((a, b) => a.order - b.order)
            .map((activity) => {
              const Icon = activity.icon
              const isActive = activeView === activity.id
              const isDragging = draggedItem === activity.id
              const isDragOver = dragOverItem === activity.id
              const isHovered = hoveredItem === activity.id
              
              return (
                <div
                  key={activity.id}
                  className={`
                    relative group
                    ${isDragOver ? 'border-t-2 border-accent' : ''}
                    ${isDragging ? 'opacity-50 scale-95' : ''}
                  `}
                  draggable
                  onDragStart={(e) => handleDragStart(e, activity.id)}
                  onDragOver={(e) => handleDragOver(e, activity.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, activity.id)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredItem(activity.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Fully Clickable Activity Button - Both Icon and Title */}
                  <button
                    onClick={() => handleActivityClick(activity)}
                    className={`
                      w-full flex items-center p-2 rounded-lg
                      transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)
                      transform hover:scale-[1.02] active:scale-[0.98]
                      ${isActive 
                        ? sidebarMerged 
                          ? 'bg-gradient-to-r from-accent to-warning text-white shadow-lg ring-2 ring-warning/50 animate-pulse' 
                          : 'bg-accent text-white shadow-lg'
                        : 'hover:bg-hover text-text-secondary hover:text-text-primary'
                      }
                      ${sidebarMerged && isActive ? 'ring-2 ring-warning/30' : ''}
                      focus:outline-none focus:ring-2 focus:ring-accent/50
                      cursor-pointer relative
                    `}
                    title={activity.description || activity.label}
                  >
                    {/* Icon Section */}
                    <div className={`
                      flex items-center justify-center rounded-md
                      ${isCollapsed ? 'w-8 h-8 mx-auto' : 'w-8 h-8 flex-shrink-0'}
                      transition-all duration-200
                    `}>
                      <Icon 
                        size={18} 
                        className={`
                          transition-all duration-200
                          ${isHovered ? 'scale-110 rotate-12' : ''}
                          ${isActive ? 'text-white' : ''}
                          ${sidebarMerged && isActive ? 'animate-bounce' : ''}
                        `}
                      />
                    </div>
                    
                    {/* Label Section - Only visible when expanded */}
                    {!isCollapsed && (
                      <div className={`
                        ml-3 flex-1 text-left overflow-hidden
                        transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                      `}>
                        <div className={`
                          text-sm font-medium truncate
                          ${isActive ? 'text-white' : 'text-text-primary'}
                        `}>
                          {activity.label}
                        </div>
                        {activity.description && (
                          <div className={`
                            text-xs truncate
                            ${isActive ? 'text-white/70' : 'text-text-muted'}
                          `}>
                            {activity.description}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Active Indicator */}
                    <div className={`
                      absolute left-0 top-1/2 transform -translate-y-1/2
                      w-1 bg-white rounded-r-full
                      transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)
                      ${isActive ? 'h-8 opacity-100' : 'h-0 opacity-0'}
                    `} />
                    
                    {/* Plugin Badge */}
                    {activity.category === 'plugin' && (
                      <div className={`
                        absolute top-1 right-1 w-2 h-2 rounded-full
                        bg-success transition-all duration-200
                        ${isHovered ? 'scale-125' : 'scale-100'}
                        ${isActive ? 'bg-white' : ''}
                      `} />
                    )}
                    
                    {/* Merged Content Indicator */}
                    {sidebarMerged && isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-ping" />
                    )}
                    
                    {/* Drag Handle - Only visible when expanded and hovered */}
                    {!isCollapsed && (
                      <div className={`
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        flex flex-col space-y-0.5 ml-2 cursor-grab
                      `}>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                        <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                        <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                      </div>
                    )}
                  </button>
                  
                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && isHovered && (
                    <div className="
                      absolute left-full ml-2 top-0 z-50
                      px-3 py-2 bg-tooltip text-white text-sm rounded-lg shadow-lg
                      pointer-events-none whitespace-nowrap
                      animate-in fade-in slide-in-from-left-2 duration-200
                    ">
                      <div className="font-medium">{activity.label}</div>
                      {activity.description && (
                        <div className="text-xs text-gray-300 mt-1">
                          {activity.description}
                        </div>
                      )}
                      
                      {/* Arrow */}
                      <div className="
                        absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2
                        w-0 h-0 border-t-4 border-t-transparent
                        border-r-4 border-r-tooltip
                        border-b-4 border-b-transparent
                      " />
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* Settings at Bottom */}
      <div className="border-t border-border p-1">
        <button
          onClick={() => onViewChange('settings')}
          onMouseEnter={() => setHoveredItem('settings')}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            w-full flex items-center p-2 rounded-lg
            transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)
            transform hover:scale-[1.02] active:scale-[0.98]
            ${activeView === 'settings' 
              ? 'bg-accent text-white shadow-lg' 
              : 'hover:bg-hover text-text-secondary hover:text-text-primary'
            }
            focus:outline-none focus:ring-2 focus:ring-accent/50
            cursor-pointer
          `}
          title="Settings and Preferences"
        >
          {/* Settings Icon */}
          <div className={`
            flex items-center justify-center rounded-md
            ${isCollapsed ? 'w-8 h-8 mx-auto' : 'w-8 h-8 flex-shrink-0'}
          `}>
            <Settings 
              size={18} 
              className={`
                transition-all duration-200
                ${hoveredItem === 'settings' ? 'scale-110 rotate-90' : ''}
              `}
            />
          </div>
          
          {/* Settings Label */}
          {!isCollapsed && (
            <div className="ml-3 flex-1 text-left">
              <div className={`
                text-sm font-medium
                ${activeView === 'settings' ? 'text-white' : 'text-text-primary'}
              `}>
                Settings
              </div>
              <div className={`
                text-xs
                ${activeView === 'settings' ? 'text-white/70' : 'text-text-muted'}
              `}>
                Configure VibeStudio
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}