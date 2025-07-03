// Collapsible Section Component for Panel Sections
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: LucideIcon
  badge?: string | number
  actions?: React.ReactNode
  className?: string
  storageKey?: string
  onToggle?: (expanded: boolean) => void
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  icon: Icon,
  badge,
  actions,
  className = '',
  storageKey,
  onToggle
}) => {
  // Load saved state from localStorage
  const getSavedState = () => {
    if (!storageKey) return defaultExpanded
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : defaultExpanded
    } catch {
      return defaultExpanded
    }
  }

  const [isExpanded, setIsExpanded] = useState(getSavedState)
  const [height, setHeight] = useState<number | 'auto'>('auto')
  const contentRef = useRef<HTMLDivElement>(null)

  // Save state to localStorage
  const saveState = (expanded: boolean) => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(expanded))
    } catch (error) {
      console.warn('Failed to save section state:', error)
    }
  }

  // Handle toggle
  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    saveState(newExpanded)
    onToggle?.(newExpanded)
  }

  // Animate height changes
  useEffect(() => {
    if (!contentRef.current) return

    if (isExpanded) {
      const scrollHeight = contentRef.current.scrollHeight
      setHeight(scrollHeight)
      
      // Set to auto after animation completes
      const timer = setTimeout(() => {
        setHeight('auto')
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setHeight(0)
    }
  }, [isExpanded])

  return (
    <div className={`border-b border-border/50 last:border-b-0 ${className}`}>
      {/* Header */}
      <div
        className="
          flex items-center justify-between p-3 cursor-pointer
          hover:bg-hover/50 transition-all duration-150
          select-none group
        "
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown 
                size={14} 
                className="text-text-secondary group-hover:text-text-primary transition-colors" 
              />
            ) : (
              <ChevronRight 
                size={14} 
                className="text-text-secondary group-hover:text-text-primary transition-colors" 
              />
            )}
          </div>

          {/* Section Icon */}
          {Icon && (
            <Icon 
              size={16} 
              className="text-text-secondary group-hover:text-accent transition-colors flex-shrink-0" 
            />
          )}

          {/* Title */}
          <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
            {title}
          </span>

          {/* Badge */}
          {badge !== undefined && (
            <span className="text-xs text-text-muted bg-secondary px-1.5 py-0.5 rounded flex-shrink-0">
              {badge}
            </span>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ 
          height: height === 'auto' ? 'auto' : `${height}px`,
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div className={`${isExpanded ? 'pb-2' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSection