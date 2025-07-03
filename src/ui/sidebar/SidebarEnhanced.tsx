// Enhanced Sidebar with Production-Grade Activity Panels
import React from 'react'
import { 
  X, Files, Search, GitBranch, Bug, Terminal, Database, Globe, 
  MessageSquare, Zap, Code, Puzzle,
  Settings as SettingsIcon, LucideIcon
} from 'lucide-react'
import FileExplorer from './FileExplorer'
import SearchPanel from './SearchPanel'
import SourceControlPanel from './SourceControlPanel'
import MergeablePanel from '../../shared/components/MergeablePanel'

interface SidebarProps {
  activeView: string
  onCollapse: () => void
  onFileOpen?: (filePath: string, line?: number) => void
  onFileSelect?: (filePath: string) => void
  onMerge?: () => void
  onUnmerge?: () => void
  isMerged?: boolean
}

export const SidebarEnhanced: React.FC<SidebarProps> = ({ 
  activeView, 
  onCollapse, 
  onFileOpen, 
  onFileSelect,
  onMerge,
  onUnmerge,
  isMerged = false
}) => {

  const getViewTitle = (view: string): string => {
    const titles: Record<string, string> = {
      explorer: 'Explorer',
      search: 'Search',
      git: 'Source Control',
      debug: 'Run and Debug',
      terminal: 'Terminal',
      database: 'Database Explorer',
      web: 'Live Server',
      ai: 'AI Assistant',
      performance: 'Performance Monitor',
      snippets: 'Code Snippets',
      extensions: 'Extensions',
      settings: 'Settings'
    }
    return titles[view] || 'Explorer'
  }

  const getViewIcon = (view: string) => {
    const icons: Record<string, LucideIcon> = {
      explorer: Files,
      search: Search,
      git: GitBranch,
      debug: Bug,
      terminal: Terminal,
      database: Database,
      web: Globe,
      ai: MessageSquare,
      performance: Zap,
      snippets: Code,
      extensions: Puzzle,
      settings: SettingsIcon
    }
    const IconComponent = icons[view] || Files
    return <IconComponent size={16} className="text-accent" />
  }

  const renderSidebarContent = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <FileExplorer 
            onFileSelect={(file) => onFileSelect?.(file.path)}
            onFileOpen={(file) => onFileOpen?.(file.path)}
          />
        )
      case 'search':
        return (
          <SearchPanel 
            onFileOpen={onFileOpen}
          />
        )
      case 'git':
        return (
          <SourceControlPanel 
            onFileOpen={onFileOpen}
          />
        )
      case 'debug':
        return <ComingSoonPanel title="Run and Debug" description="Debug your applications with breakpoints and step-through debugging." />
      case 'terminal':
        return <ComingSoonPanel title="Terminal Integration" description="Terminal functionality is available in the bottom panel." />
      case 'database':
        return <ComingSoonPanel title="Database Connections" description="Connect and browse your databases with smart query tools." />
      case 'web':
        return <ComingSoonPanel title="Live Server" description="Preview your web applications in real-time with hot reload." />
      case 'ai':
        return <ComingSoonPanel title="AI Assistant" description="AI-powered coding assistance and intelligent suggestions." />
      case 'performance':
        return <ComingSoonPanel title="Performance Monitor" description="Monitor application performance metrics and optimize your code." />
      case 'snippets':
        return <ComingSoonPanel title="Code Snippets" description="Manage your personal code snippets library and templates." />
      case 'extensions':
        return <ComingSoonPanel title="Extensions" description="Discover and manage VibeStudio extensions to enhance your workflow." />
      case 'settings':
        return <ComingSoonPanel title="Settings" description="Configure VibeStudio preferences and customize your development environment." />
      default:
        return (
          <FileExplorer 
            onFileSelect={(file) => onFileSelect?.(file.path)}
            onFileOpen={(file) => onFileOpen?.(file.path)}
          />
        )
    }
  }

  return (
    <MergeablePanel
      initialWidth={320}
      minWidth={260}
      maxWidth={640}
      storageKey={`vibestudio-sidebar-${activeView}-width`}
      className="shadow-sm"
      onMerge={onMerge}
      onUnmerge={onUnmerge}
      isMerged={isMerged}
      mergeThreshold={80}
    >
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-secondary/50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          {getViewIcon(activeView)}
          <h2 className="text-sm font-semibold text-text-primary">
            {getViewTitle(activeView)}
          </h2>
        </div>
        <button
          onClick={onCollapse}
          className="
            w-6 h-6 flex items-center justify-center rounded
            hover:bg-hover transition-all duration-200
            transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-accent/50
          "
          title="Hide Sidebar"
        >
          <X size={14} className="text-text-secondary" />
        </button>
      </div>

      {/* Content with smooth transitions */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full">
          {renderSidebarContent()}
        </div>
      </div>
    </MergeablePanel>
  )
}

// Fallback component for views under development
const ComingSoonPanel: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="p-4 h-full flex flex-col items-center justify-center text-center">
    <div className="text-lg font-semibold text-text-primary mb-2">{title}</div>
    <div className="text-sm text-text-secondary mb-4">{description}</div>
    <div className="text-xs text-text-muted">Feature coming soon...</div>
  </div>
)