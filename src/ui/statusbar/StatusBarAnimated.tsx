// Enhanced StatusBar with Smooth Animations
import React, { useState, useEffect } from 'react'
import { Settings, Terminal, Bell, GitBranch, Wifi, Zap, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../shared/hooks/useTheme'

interface StatusBarProps {
  onTogglePanel: () => void
}

export const StatusBarAnimated: React.FC<StatusBarProps> = ({ onTogglePanel }) => {
  const { theme, toggleTheme } = useTheme()
  const [time, setTime] = useState(new Date())
  const [notifications, setNotifications] = useState(0)
  const [isConnected, setIsConnected] = useState(true)
  const [cpuUsage, setCpuUsage] = useState(Math.floor(Math.random() * 30) + 10)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate dynamic data
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 10)
      if (Math.random() > 0.9) {
        setNotifications(prev => prev + 1)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const clearNotifications = () => {
    setNotifications(0)
  }

  return (
    <div className="h-6 bg-accent text-white flex items-center justify-between px-4 text-xs font-medium shadow-lg">
      {/* Left Section - File and Git Info */}
      <div className="flex items-center space-x-4">
        <button 
          className="
            flex items-center space-x-1 
            hover:bg-white/10 px-2 py-1 rounded 
            transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
          title="Git Branch"
        >
          <GitBranch size={10} className="transition-transform duration-200 hover:rotate-12" />
          <span className="fade-slide-in">main</span>
          <div className="w-1 h-1 bg-success rounded-full animate-pulse ml-1" />
        </button>
        
        <div className="flex items-center space-x-2 text-white/80">
          <span className="transition-all duration-200">TypeScript</span>
          <span>•</span>
          <span className="transition-all duration-200">UTF-8</span>
          <span>•</span>
          <span className="transition-all duration-200">Ln 1, Col 1</span>
        </div>
      </div>

      {/* Center Section - Tagline */}
      <div className="flex items-center space-x-2">
        <span className="text-white/90 font-semibold tracking-wide">
          Where Code Meets Flow
        </span>
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-white/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Right Section - Status and Controls */}
      <div className="flex items-center space-x-2">
        {/* CPU Usage Indicator */}
        <div className="flex items-center space-x-1 text-white/80">
          <Zap size={10} />
          <span className="font-mono">CPU: {cpuUsage}%</span>
          <div 
            className="w-8 h-1 bg-white/20 rounded-full overflow-hidden"
            title={`CPU Usage: ${cpuUsage}%`}
          >
            <div 
              className="h-full bg-gradient-to-r from-success to-warning rounded-full transition-all duration-500"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Terminal Toggle */}
        <button 
          onClick={onTogglePanel}
          className="
            flex items-center space-x-1 
            hover:bg-white/10 px-2 py-1 rounded 
            transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-white/30
            ripple
          "
          title="Toggle Terminal Panel"
        >
          <Terminal size={10} className="transition-transform duration-200 hover:rotate-12" />
          <span>Terminal</span>
        </button>
        
        {/* Connection Status */}
        <button 
          className={`
            flex items-center space-x-1 px-2 py-1 rounded
            transition-all duration-200 transform hover:scale-105
            ${isConnected 
              ? 'hover:bg-white/10 text-white' 
              : 'bg-error/20 text-error animate-pulse'
            }
            focus:outline-none focus:ring-2 focus:ring-white/30
          `}
          title={isConnected ? "Connected" : "Disconnected"}
          onClick={() => setIsConnected(!isConnected)}
        >
          <Wifi 
            size={10} 
            className={`
              transition-all duration-200
              ${isConnected ? 'text-success' : 'text-error'}
            `}
          />
          <span className="text-xs">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </button>
        
        {/* Notifications */}
        <button 
          onClick={clearNotifications}
          className="
            relative flex items-center 
            hover:bg-white/10 px-2 py-1 rounded 
            transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
          title={`${notifications} notifications`}
        >
          <Bell 
            size={10} 
            className={`
              transition-all duration-200
              ${notifications > 0 ? 'animate-bounce text-warning' : 'text-white/80'}
            `}
          />
          {notifications > 0 && (
            <div className="
              absolute -top-1 -right-1 w-3 h-3 
              bg-error text-white text-xs rounded-full 
              flex items-center justify-center
              animate-pulse font-bold
            ">
              {notifications > 9 ? '9+' : notifications}
            </div>
          )}
        </button>
        
        {/* Theme Toggle with Enhanced Animation */}
        <button 
          onClick={toggleTheme}
          className="
            relative flex items-center space-x-1
            hover:bg-white/10 px-2 py-1 rounded 
            transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-white/30
            theme-toggle
          "
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="relative w-4 h-4 overflow-hidden">
            <div className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-300 transform
              ${theme === 'light' 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0'
              }
            `}>
              <Sun size={10} className="text-warning" />
            </div>
            <div className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-300 transform
              ${theme === 'dark' 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-full opacity-0'
              }
            `}>
              <Moon size={10} className="text-blue-200" />
            </div>
          </div>
          <span className="text-xs">
            {theme === 'light' ? 'Light' : 'Dark'}
          </span>
        </button>
        
        {/* Time Display */}
        <div className="text-white/80 font-mono text-xs px-2">
          {formatTime(time)}
        </div>
        
        {/* Settings */}
        <button 
          className="
            flex items-center 
            hover:bg-white/10 px-2 py-1 rounded 
            transition-all duration-200 transform hover:scale-105 hover:rotate-90
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
          title="Settings"
        >
          <Settings size={10} className="text-white/80 transition-transform duration-200" />
        </button>
      </div>
    </div>
  )
}