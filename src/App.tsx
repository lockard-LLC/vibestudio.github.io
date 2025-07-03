import { useState } from 'react'
import { ActivityBarFinal as ActivityBar } from './ui/sidebar/ActivityBarFinal'
import { SidebarEnhanced as Sidebar } from './ui/sidebar/SidebarEnhanced'
import { EditorAreaAnimated as EditorArea } from './core/editor/EditorAreaAnimated'
import { StatusBarAnimated as StatusBar } from './ui/statusbar/StatusBarAnimated'
import { PanelAnimated as Panel } from './ui/panels/PanelAnimated'
import { MenuBar } from './ui/menubar/MenuBar'
import { ThemeProvider } from './shared/contexts/ThemeContext'

function App() {
  const [activeView, setActiveView] = useState('explorer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMerged, setSidebarMerged] = useState(false)
  const [panelVisible, setPanelVisible] = useState(true)
  const [panelHeight, setPanelHeight] = useState(250)

  const handleFileOpen = (filePath: string, line?: number) => {
    // TODO: Implement file opening logic
    void filePath
    void line
  }

  const handleFileSelect = (filePath: string) => {
    // TODO: Implement file selection logic
    void filePath
  }

  const handleMenuAction = (actionId: string, params?: unknown) => {
    // TODO: Implement menu actions
    void params
    switch (actionId) {
      case 'new-file':
        // Create new file
        break
      case 'open-file':
        // Open file dialog
        break
      case 'save':
        // Save current file
        break
      // Add more menu actions as needed
    }
  }

  const handleSidebarMerge = () => {
    setSidebarMerged(true)
  }

  const handleSidebarUnmerge = () => {
    setSidebarMerged(false)
  }

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col bg-primary text-text-primary overflow-hidden">
        {/* Menu Bar */}
        <MenuBar onAction={handleMenuAction} />
        
        {/* Main IDE Layout */}
        <div className="flex-1 flex">
          {/* Activity Bar */}
          <ActivityBar 
            activeView={activeView}
            onViewChange={setActiveView}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarMerged={sidebarMerged}
            onUnmergeSidebar={handleSidebarUnmerge}
          />

          {/* Sidebar */}
          {!sidebarCollapsed && (
            <Sidebar 
              activeView={activeView}
              onCollapse={() => setSidebarCollapsed(true)}
              onFileOpen={handleFileOpen}
              onFileSelect={handleFileSelect}
              onMerge={handleSidebarMerge}
              onUnmerge={handleSidebarUnmerge}
              isMerged={sidebarMerged}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Editor Area */}
            <div 
              className="flex-1 flex"
              style={{ 
                height: panelVisible ? `calc(100% - ${panelHeight}px)` : '100%' 
              }}
            >
              <EditorArea />
            </div>

            {/* Bottom Panel */}
            {panelVisible && (
              <Panel 
                height={panelHeight}
                onHeightChange={setPanelHeight}
                onClose={() => setPanelVisible(false)}
              />
            )}
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar 
          onTogglePanel={() => setPanelVisible(!panelVisible)}
        />
      </div>
    </ThemeProvider>
  )
}

export default App