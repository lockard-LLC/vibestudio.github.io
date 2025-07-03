// src/ui/sidebar/Sidebar.tsx (Updated with AI Integration)
import React from 'react'
import { X } from 'lucide-react'
import { FileExplorer } from '../../core/explorer/FileExplorer'
import { ChatInterface } from '../../ai/chat/ChatInterface'

interface SidebarProps {
  activeView: string
  onCollapse: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onCollapse }) => {
  return (
    <div className="w-80 bg-primary border-r border-border flex flex-col">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-border">
        <h2 className="text-sm font-medium text-text-primary">
          {getViewTitle(activeView)}
        </h2>
        <button
          onClick={onCollapse}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          title="Hide Sidebar"
        >
          <X size={14} className="text-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderSidebarContent(activeView)}
      </div>
    </div>
  )
}

function getViewTitle(view: string): string {
  const titles: Record<string, string> = {
    explorer: 'Explorer',
    search: 'Search',
    git: 'Source Control',
    extensions: 'Extensions',
    ai: 'AI Chat',
    settings: 'Settings'
  }
  return titles[view] || 'Explorer'
}

function renderSidebarContent(activeView: string) {
  switch (activeView) {
    case 'explorer':
      return <FileExplorer />
    case 'search':
      return <SearchPanel />
    case 'git':
      return <GitPanel />
    case 'ai':
      return <ChatInterface />
    case 'extensions':
      return <ExtensionsPanel />
    case 'settings':
      return <SettingsPanel />
    default:
      return <FileExplorer />
  }
}

// Search Panel Component
const SearchPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<any[]>([])

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <input
          type="text"
          placeholder="Files to include..."
          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <input
          type="text"
          placeholder="Files to exclude..."
          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="mt-6 flex-1">
        {searchQuery ? (
          <div className="text-sm text-text-secondary">
            {searchResults.length === 0
              ? `No results found for "${searchQuery}"`
              : `${searchResults.length} results found`
            }
          </div>
        ) : (
          <div className="text-sm text-text-muted">
            Enter search terms to find files and content
          </div>
        )}
      </div>
    </div>
  )
}

// Git Panel Component
const GitPanel: React.FC = () => (
  <div className="p-4 h-full">
    <div className="space-y-4">
      <div className="text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-text-primary">Source Control</span>
          <span className="text-xs text-text-muted">Git</span>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-secondary rounded-lg">
            <div className="text-xs text-text-muted mb-1">CHANGES</div>
            <div className="text-sm text-text-secondary">
              No changes detected
            </div>
          </div>

          <div className="p-3 bg-secondary rounded-lg">
            <div className="text-xs text-text-muted mb-1">STAGED CHANGES</div>
            <div className="text-sm text-text-secondary">
              No staged changes
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <button className="w-full px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm">
          Initialize Repository
        </button>
      </div>
    </div>

    <div className="mt-6 text-xs text-text-muted">
      Git integration coming soon...
    </div>
  </div>
)

// Extensions Panel Component
const ExtensionsPanel: React.FC = () => (
  <div className="p-4 h-full">
    <div className="space-y-4">
      <div className="text-sm">
        <div className="font-medium text-text-primary mb-3">Recommended Extensions</div>

        <div className="space-y-3">
          {[
            { name: 'Prettier', desc: 'Code formatter', status: 'Built-in' },
            { name: 'ESLint', desc: 'JavaScript linter', status: 'Built-in' },
            { name: 'TypeScript', desc: 'Language support', status: 'Built-in' },
            { name: 'Tailwind CSS', desc: 'CSS framework', status: 'Built-in' },
            { name: 'AI Assistant', desc: 'Claude & GPT integration', status: 'Active' }
          ].map((ext, index) => (
            <div key={index} className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-primary text-sm">{ext.name}</span>
                <span className={`text-xs ${ext.status === 'Active' ? 'text-accent' : 'text-success'}`}>
                  {ext.status}
                </span>
              </div>
              <div className="text-xs text-text-muted">{ext.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="text-xs text-text-muted">
          Extension marketplace coming soon...
        </div>
      </div>
    </div>
  </div>
)

// Settings Panel Component
const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = React.useState({
    theme: 'light',
    fontSize: 14,
    tabSize: 2,
    wordWrap: false,
    minimap: true,
    autoSave: true,
    aiProvider: 'anthropic'
  })

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Editor</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Font Size</label>
              <input
                type="number"
                min="10"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-16 px-2 py-1 bg-secondary border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Tab Size</label>
              <input
                type="number"
                min="1"
                max="8"
                value={settings.tabSize}
                onChange={(e) => updateSetting('tabSize', parseInt(e.target.value))}
                className="w-16 px-2 py-1 bg-secondary border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Word Wrap</label>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => updateSetting('wordWrap', e.target.checked)}
                className="rounded border border-border focus:ring-1 focus:ring-accent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Minimap</label>
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => updateSetting('minimap', e.target.checked)}
                className="rounded border border-border focus:ring-1 focus:ring-accent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Auto Save</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                className="rounded border border-border focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">AI Assistant</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Default Provider</label>
              <select
                value={settings.aiProvider}
                onChange={(e) => updateSetting('aiProvider', e.target.value)}
                className="px-2 py-1 bg-secondary border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai">OpenAI GPT</option>
              </select>
            </div>

            <div className="p-3 bg-info/10 rounded-lg border border-info/20">
              <div className="text-xs text-info font-medium mb-1">
                🤖 AI Features Available
              </div>
              <div className="text-xs text-text-secondary">
                Chat with AI, get code help, debug issues, and learn new concepts.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-text-primary mb-3">About</h3>
          <div className="space-y-2 text-xs text-text-muted">
            <div>VibeStudio v0.1.0-beta</div>
            <div>Built with Monaco Editor</div>
            <div>AI powered by Claude & GPT</div>
            <div>Your Creative Code Space</div>
          </div>
        </div>
      </div>
    </div>
  )
}
