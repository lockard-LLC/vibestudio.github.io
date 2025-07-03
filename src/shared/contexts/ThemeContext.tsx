// src/shared/contexts/ThemeContext.tsx
import React, { useEffect, useState } from 'react'
import { ThemeContext, type Theme, type ThemeContextType } from './theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('vibestudio-theme') as Theme
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  const setTheme = (newTheme: Theme) => {
    // Add smooth transition during theme change
    document.documentElement.style.transition = 'background-color 0.3s ease-out, color 0.3s ease-out'
    
    setThemeState(newTheme)
    localStorage.setItem('vibestudio-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Remove transition after theme change completes
    setTimeout(() => {
      document.documentElement.style.transition = ''
    }, 300)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    
    // Add a subtle flash effect during theme transition
    const flashOverlay = document.createElement('div')
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${newTheme === 'dark' ? '#000' : '#fff'};
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.15s ease-out;
    `
    
    document.body.appendChild(flashOverlay)
    
    // Flash effect
    requestAnimationFrame(() => {
      flashOverlay.style.opacity = '0.1'
      setTimeout(() => {
        flashOverlay.style.opacity = '0'
        setTimeout(() => {
          document.body.removeChild(flashOverlay)
        }, 150)
      }, 50)
    })
    
    setTheme(newTheme)
  }

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.setAttribute('data-theme', theme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a theme
      const hasManualTheme = localStorage.getItem('vibestudio-theme')
      if (!hasManualTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}