// Resizable Panel Hook
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseResizableOptions {
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  onResize?: (width: number) => void
}

interface ResizableState {
  width: number
  isResizing: boolean
  startX: number
  startWidth: number
}

export const useResizable = ({
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 800,
  storageKey,
  onResize
}: UseResizableOptions = {}) => {
  // Load saved width from localStorage
  const getSavedWidth = useCallback(() => {
    if (!storageKey) return initialWidth
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? Number(saved) : initialWidth
    } catch {
      return initialWidth
    }
  }, [storageKey, initialWidth])

  const [state, setState] = useState<ResizableState>({
    width: getSavedWidth(),
    isResizing: false,
    startX: 0,
    startWidth: 0
  })

  const panelRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

  // Save width to localStorage
  const saveWidth = useCallback((width: number) => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, width.toString())
    } catch (error) {
      console.warn('Failed to save panel width:', error)
    }
  }, [storageKey])

  // Handle mouse down on resizer
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setState(prev => ({
      ...prev,
      isResizing: true,
      startX: e.clientX,
      startWidth: prev.width
    }))
  }, [])

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!state.isResizing) return

    const deltaX = e.clientX - state.startX
    const newWidth = Math.min(maxWidth, Math.max(minWidth, state.startWidth + deltaX))
    
    setState(prev => ({
      ...prev,
      width: newWidth
    }))

    onResize?.(newWidth)
  }, [state.isResizing, state.startX, state.startWidth, minWidth, maxWidth, onResize])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (state.isResizing) {
      setState(prev => ({
        ...prev,
        isResizing: false,
        startX: 0,
        startWidth: 0
      }))
      saveWidth(state.width)
    }
  }, [state.isResizing, state.width, saveWidth])

  // Add global event listeners
  useEffect(() => {
    if (state.isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [state.isResizing, handleMouseMove, handleMouseUp])

  // Double-click to reset to default width
  const handleDoubleClick = useCallback(() => {
    setState(prev => ({
      ...prev,
      width: initialWidth
    }))
    saveWidth(initialWidth)
    onResize?.(initialWidth)
  }, [initialWidth, saveWidth, onResize])

  return {
    width: state.width,
    isResizing: state.isResizing,
    panelRef,
    resizerRef,
    handleMouseDown,
    handleDoubleClick,
    setWidth: (width: number) => {
      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, width))
      setState(prev => ({ ...prev, width: clampedWidth }))
      saveWidth(clampedWidth)
      onResize?.(clampedWidth)
    }
  }
}

export default useResizable