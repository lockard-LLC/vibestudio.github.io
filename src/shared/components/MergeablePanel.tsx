// Enhanced Resizable Panel with ActivityBar Merge Functionality
import React, { useState, useCallback, useEffect } from 'react'
import { useResizable } from '../hooks/useResizable'

interface MergeablePanelProps {
  children: React.ReactNode
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  className?: string
  onResize?: (width: number) => void
  onMerge?: () => void
  onUnmerge?: () => void
  isMerged?: boolean
  mergeThreshold?: number
  disabled?: boolean
}

export const MergeablePanel: React.FC<MergeablePanelProps> = ({
  children,
  initialWidth = 320,
  maxWidth = 640,
  storageKey,
  className = '',
  onResize,
  onMerge,
  onUnmerge,
  isMerged = false,
  mergeThreshold = 100,
  disabled = false
}) => {
  const [isMerging, setIsMerging] = useState(false)
  const [mergeProgress, setMergeProgress] = useState(0)

  const {
    width,
    isResizing,
    panelRef,
    resizerRef,
    handleMouseDown: originalHandleMouseDown,
    handleDoubleClick
  } = useResizable({
    initialWidth: isMerged ? 0 : initialWidth,
    minWidth: 0, // Allow merging to 0
    maxWidth,
    storageKey,
    onResize: (newWidth) => {
      if (newWidth > mergeThreshold) {
        if (isMerged) {
          setIsMerging(true)
          onUnmerge?.()
          setTimeout(() => setIsMerging(false), 300)
        }
      } else if (newWidth <= mergeThreshold && !isMerged) {
        setIsMerging(true)
        onMerge?.()
        setTimeout(() => setIsMerging(false), 300)
      }
      
      // Calculate merge progress for animation
      const progress = Math.max(0, Math.min(1, (mergeThreshold - newWidth) / mergeThreshold))
      setMergeProgress(progress)
      
      onResize?.(newWidth)
    }
  })

  // Enhanced mouse down handler with merge detection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    originalHandleMouseDown(e)
  }, [disabled, originalHandleMouseDown])

  // Handle unmerge when clicked from ActivityBar
  const handleUnmerge = useCallback(() => {
    if (isMerged) {
      setIsMerging(true)
      onUnmerge?.()
      setTimeout(() => setIsMerging(false), 300)
    }
  }, [isMerged, onUnmerge])

  // Expose unmerge function for parent components
  useEffect(() => {
    if (panelRef.current) {
      (panelRef.current as HTMLDivElement & { unmerge?: () => void }).unmerge = handleUnmerge
    }
  }, [handleUnmerge, panelRef])

  const currentWidth = isMerged ? 0 : width
  const shouldShowContent = !isMerged || isMerging

  return (
    <div
      ref={panelRef}
      className={`relative bg-primary border-r border-border flex overflow-hidden ${className}`}
      style={{ 
        width: `${currentWidth}px`,
        transition: isResizing ? 'none' : 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        opacity: isMerging ? 0.8 : 1
      }}
    >
      {/* Panel Content with Merge Animation */}
      <div 
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{
          transform: isMerged ? 'translateX(-100%)' : 'translateX(0)',
          transition: isMerging ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          opacity: shouldShowContent ? 1 : 0
        }}
      >
        {/* Merge Progress Indicator */}
        {mergeProgress > 0 && mergeProgress < 1 && (
          <div 
            className="absolute top-0 left-0 right-0 h-1 bg-accent z-50"
            style={{
              transform: `scaleX(${mergeProgress})`,
              transformOrigin: 'left',
              transition: 'transform 0.1s ease-out'
            }}
          />
        )}
        
        {/* Content Fade Effect During Merge */}
        <div 
          className="flex-1 flex flex-col"
          style={{
            opacity: 1 - (mergeProgress * 0.7),
            filter: mergeProgress > 0.5 ? 'blur(1px)' : 'none',
            transition: 'opacity 0.2s ease-out, filter 0.2s ease-out'
          }}
        >
          {children}
        </div>
      </div>

      {/* Enhanced Resizer Handle with Merge Visual Feedback */}
      {!disabled && (
        <div
          ref={resizerRef}
          className={`
            absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10
            hover:w-3 transition-all duration-200
            ${isResizing 
              ? 'bg-accent w-3 shadow-lg scale-y-105' 
              : 'bg-transparent hover:bg-accent/40'
            }
            ${mergeProgress > 0.3 ? 'bg-gradient-to-r from-accent to-warning' : ''}
            group
          `}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title={mergeProgress > 0.5 ? "Release to merge with ActivityBar" : "Drag to resize, double-click to reset"}
        >
          {/* Merge Indicator */}
          {mergeProgress > 0.3 && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-accent/20 to-warning/20 animate-pulse"
              style={{
                opacity: mergeProgress,
                background: `linear-gradient(90deg, 
                  rgba(59, 130, 246, ${0.2 * mergeProgress}) 0%, 
                  rgba(245, 158, 11, ${0.4 * mergeProgress}) 100%)`
              }}
            />
          )}
          
          {/* Visual resize indicator */}
          <div 
            className={`
              absolute inset-y-0 left-1/2 transform -translate-x-1/2
              w-0.5 bg-border opacity-0 group-hover:opacity-100
              transition-all duration-200
              ${isResizing ? 'opacity-100 bg-accent w-1' : ''}
              ${mergeProgress > 0.5 ? 'bg-warning animate-pulse' : ''}
            `}
          />
          
          {/* Dynamic Resize Dots */}
          <div 
            className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              flex flex-col space-y-1 opacity-0 group-hover:opacity-100
              transition-all duration-200
              ${isResizing ? 'opacity-100 scale-110' : ''}
              ${mergeProgress > 0.5 ? 'animate-bounce' : ''}
            `}
          >
            <div 
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                mergeProgress > 0.5 ? 'bg-warning' : 'bg-current'
              }`} 
            />
            <div 
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                mergeProgress > 0.3 ? 'bg-warning' : 'bg-current'
              }`} 
            />
            <div 
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                mergeProgress > 0.1 ? 'bg-accent' : 'bg-current'
              }`} 
            />
          </div>

          {/* Merge Arrow Animation */}
          {mergeProgress > 0.6 && (
            <div className="absolute top-1/2 right-1 transform -translate-y-1/2 animate-pulse">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-0.5 bg-warning rounded" 
                     style={{ 
                       transform: `scaleX(${mergeProgress})`,
                       transformOrigin: 'right'
                     }} 
                />
                <div className="w-0 h-0 border-t-2 border-b-2 border-l-2 border-transparent border-l-warning" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MergeablePanel