// Resizable Panel Component
import React from 'react'
import { useResizable } from '../hooks/useResizable'

interface ResizablePanelProps {
  children: React.ReactNode
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  className?: string
  onResize?: (width: number) => void
  disabled?: boolean
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 800,
  storageKey,
  className = '',
  onResize,
  disabled = false
}) => {
  const {
    width,
    isResizing,
    panelRef,
    resizerRef,
    handleMouseDown,
    handleDoubleClick
  } = useResizable({
    initialWidth,
    minWidth,
    maxWidth,
    storageKey,
    onResize
  })

  return (
    <div
      ref={panelRef}
      className={`relative bg-primary border-r border-border flex ${className}`}
      style={{ 
        width: `${width}px`,
        transition: isResizing ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Resizer Handle */}
      {!disabled && (
        <div
          ref={resizerRef}
          className={`
            absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-10
            hover:w-2 transition-all duration-200
            ${isResizing 
              ? 'bg-accent w-2 shadow-lg' 
              : 'bg-transparent hover:bg-accent/30'
            }
            group
          `}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title="Drag to resize, double-click to reset"
        >
          {/* Visual resize indicator */}
          <div 
            className={`
              absolute inset-y-0 left-1/2 transform -translate-x-1/2
              w-0.5 bg-border opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              ${isResizing ? 'opacity-100 bg-accent' : ''}
            `}
          />
          
          {/* Resize dots indicator */}
          <div 
            className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              flex flex-col space-y-1 opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              ${isResizing ? 'opacity-100' : ''}
            `}
          >
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ResizablePanel