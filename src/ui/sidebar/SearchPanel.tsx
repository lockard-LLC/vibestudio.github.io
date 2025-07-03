// Production-Grade Search Panel Component
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Search, X, ChevronDown, ChevronRight,
  Filter, Replace,
  Copy, ExternalLink, RefreshCw, Settings
} from 'lucide-react'
import FileSystemService, { SearchResult } from '../../shared/services/FileSystemService'
import CollapsibleSection from '../../shared/components/CollapsibleSection'

interface SearchPanelProps {
  onFileOpen?: (filePath: string, line?: number) => void
}

interface SearchOptions {
  caseSensitive: boolean
  wholeWord: boolean
  useRegex: boolean
  includeFiles: string
  excludeFiles: string
}

interface GroupedResults {
  [filePath: string]: SearchResult[]
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onFileOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({})
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    includeFiles: '',
    excludeFiles: 'node_modules,dist,build,.git'
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Group results by file
    const grouped = searchResults.reduce((acc, result) => {
      if (!acc[result.file]) {
        acc[result.file] = []
      }
      acc[result.file].push(result)
      return acc
    }, {} as GroupedResults)
    
    setGroupedResults(grouped)
    
    // Auto-expand files with results
    setExpandedFiles(new Set(Object.keys(grouped)))
  }, [searchResults])

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await FileSystemService.searchFiles(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, performSearch])

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath)
    } else {
      newExpanded.add(filePath)
    }
    setExpandedFiles(newExpanded)
  }

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(`${result.file}:${result.line}:${result.column}`)
    onFileOpen?.(result.file, result.line)
  }

  const handleReplaceAll = async () => {
    if (!replaceQuery || !searchQuery.trim()) return
    
    try {
      // TODO: Implementation would depend on file system API
      // Replace all functionality placeholder
      // After replace, refresh search
      await performSearch()
    } catch (error) {
      console.error('Replace failed:', error)
    }
  }

  const handleReplaceInFile = async (filePath: string) => {
    if (!replaceQuery || !searchQuery.trim()) return
    
    try {
      // TODO: Implementation would depend on file system API
      // Replace in file functionality placeholder
      void filePath // Suppress unused parameter warning
      await performSearch()
    } catch (error) {
      console.error('Replace in file failed:', error)
    }
  }

  const copyResultToClipboard = (result: SearchResult) => {
    const text = `${result.file}:${result.line}:${result.column} - ${result.text}`
    navigator.clipboard.writeText(text)
  }

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()
    return FileSystemService.getFileIcon(extension)
  }

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath
  }

  const getFileDirectory = (filePath: string) => {
    const parts = filePath.split('/')
    return parts.slice(0, -1).join('/')
  }

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query})`, searchOptions.caseSensitive ? 'g' : 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => {
      const isMatch = regex.test(part)
      return isMatch ? (
        <span key={index} className="bg-warning/30 text-warning-foreground font-semibold">
          {part}
        </span>
      ) : part
    })
  }

  const totalResults = searchResults.length
  const totalFiles = Object.keys(groupedResults).length

  return (
    <div className="h-full flex flex-col">
      {/* Search Input Section */}
      <CollapsibleSection
        title="Search"
        icon={Search}
        defaultExpanded={true}
        storageKey="search-panel-input"
        actions={
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`
                w-5 h-5 flex items-center justify-center rounded transition-colors
                ${showOptions ? 'bg-accent text-white' : 'hover:bg-hover text-text-secondary'}
              `}
              title="Search Options"
            >
              <Filter size={10} />
            </button>
            
            <button
              onClick={() => setShowReplace(!showReplace)}
              className={`
                w-5 h-5 flex items-center justify-center rounded transition-colors
                ${showReplace ? 'bg-accent text-white' : 'hover:bg-hover text-text-secondary'}
              `}
              title="Toggle Replace"
            >
              <Replace size={10} />
            </button>
          </div>
        }
      >
        <div className="px-3 pb-2 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500/60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-10 pr-10 py-3 
                bg-gradient-to-r from-white/90 to-blue-50/70
                dark:from-slate-800/90 dark:to-blue-950/50
                border border-blue-200/60 dark:border-blue-700/60
                rounded-xl text-sm text-slate-700 dark:text-slate-300
                placeholder-blue-400/60 dark:placeholder-blue-500/60
                focus:outline-none focus:ring-2 focus:ring-blue-400/50 
                focus:border-blue-400/80 focus:bg-white dark:focus:bg-slate-800
                transition-all duration-300 shadow-sm backdrop-blur-sm
              "
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="
                  absolute right-3 top-1/2 transform -translate-y-1/2
                  w-6 h-6 flex items-center justify-center rounded-lg
                  bg-red-100/60 hover:bg-red-200/80 dark:bg-red-900/40 dark:hover:bg-red-800/60
                  text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300
                  transition-all duration-300 hover:scale-110
                "
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Replace Input */}
          {showReplace && (
            <div className="relative animate-in slide-in-from-top-2 duration-300">
              <Replace size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500/60" />
              <input
                ref={replaceInputRef}
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="
                  w-full pl-10 pr-16 py-3
                  bg-gradient-to-r from-orange-50/70 to-red-50/50
                  dark:from-orange-950/40 dark:to-red-950/30
                  border border-orange-200/60 dark:border-orange-700/60
                  rounded-xl text-sm text-slate-700 dark:text-slate-300
                  placeholder-orange-400/60 dark:placeholder-orange-500/60
                  focus:outline-none focus:ring-2 focus:ring-orange-400/50 
                  focus:border-orange-400/80 focus:bg-white dark:focus:bg-slate-800
                  transition-all duration-300 shadow-sm backdrop-blur-sm
                "
              />
              <button
                onClick={handleReplaceAll}
                disabled={!searchQuery || !replaceQuery}
                className="
                  absolute right-2 top-1/2 transform -translate-y-1/2
                  text-xs px-3 py-1.5 
                  bg-gradient-to-r from-orange-500 to-red-500 text-white 
                  rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                  hover:from-orange-600 hover:to-red-600 transition-all duration-300
                  hover:scale-105 hover:shadow-md
                  font-medium
                "
              >
                All
              </button>
            </div>
          )}

          {/* Results Summary */}
          {searchQuery && (
            <div className="flex items-center justify-between p-2 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg border border-blue-200/40 dark:border-blue-800/40">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {isSearching ? (
                  <span className="flex items-center space-x-2">
                    <span>Searching...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{totalResults}</span>
                    <span>results in</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{totalFiles}</span>
                    <span>files</span>
                  </span>
                )}
              </span>
              {isSearching && (
                <div className="relative">
                  <RefreshCw size={14} className="animate-spin text-blue-500" />
                  <div className="absolute inset-0 animate-ping">
                    <RefreshCw size={14} className="text-blue-300 opacity-75" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Search Options */}
      {showOptions && (
        <CollapsibleSection
          title="Search Options"
          icon={Settings}
          defaultExpanded={true}
          storageKey="search-panel-options"
        >
          <div className="px-6 py-4">
            <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50/80 to-blue-50/60 dark:from-slate-800/80 dark:to-blue-950/40 rounded-xl border border-blue-200/40 dark:border-blue-700/40">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1 text-xs">
                  <input
                    type="checkbox"
                    checked={searchOptions.caseSensitive}
                    onChange={(e) => setSearchOptions(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span>Case sensitive</span>
                </label>
                
                <label className="flex items-center space-x-1 text-xs">
                  <input
                    type="checkbox"
                    checked={searchOptions.wholeWord}
                    onChange={(e) => setSearchOptions(prev => ({ ...prev, wholeWord: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span>Whole word</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1 text-xs">
                  <input
                    type="checkbox"
                    checked={searchOptions.useRegex}
                    onChange={(e) => setSearchOptions(prev => ({ ...prev, useRegex: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span>Regex</span>
                </label>
              </div>
              
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Include files (e.g., *.ts,*.tsx)"
                  value={searchOptions.includeFiles}
                  onChange={(e) => setSearchOptions(prev => ({ ...prev, includeFiles: e.target.value }))}
                  className="w-full px-2 py-1 text-xs bg-secondary border border-border rounded"
                />
                
                <input
                  type="text"
                  placeholder="Exclude files"
                  value={searchOptions.excludeFiles}
                  onChange={(e) => setSearchOptions(prev => ({ ...prev, excludeFiles: e.target.value }))}
                  className="w-full px-2 py-1 text-xs bg-secondary border border-border rounded"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Results */}
      {searchQuery && totalResults > 0 && (
        <CollapsibleSection
          title="Results"
          badge={totalResults}
          defaultExpanded={true}
          storageKey="search-panel-results"
        >
          <div className="max-h-96 overflow-y-auto px-2">
            {Object.entries(groupedResults).map(([filePath, results]) => {
          const isExpanded = expandedFiles.has(filePath)
          const fileName = getFileName(filePath)
          const fileDir = getFileDirectory(filePath)
          
          return (
            <div key={filePath} className="border-b border-border/50">
              {/* File Header */}
              <div
                className="flex items-center justify-between p-2 hover:bg-hover cursor-pointer transition-colors"
                onClick={() => toggleFileExpansion(filePath)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {isExpanded ? (
                      <ChevronDown size={12} className="text-text-secondary" />
                    ) : (
                      <ChevronRight size={12} className="text-text-secondary" />
                    )}
                  </div>
                  
                  <span className="text-sm">{getFileIcon(filePath)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {fileName}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {fileDir}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-text-muted bg-secondary px-1.5 py-0.5 rounded">
                    {results.length}
                  </span>
                  
                  {showReplace && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReplaceInFile(filePath)
                      }}
                      className="text-xs px-2 py-0.5 bg-accent text-white rounded hover:bg-accent/80"
                    >
                      Replace
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {isExpanded && (
                <div className="pb-2">
                  {results.map((result, index) => {
                    const resultId = `${result.file}:${result.line}:${result.column}`
                    const isSelected = selectedResult === resultId
                    
                    return (
                      <div
                        key={index}
                        className={`
                          flex items-start p-2 ml-6 hover:bg-hover cursor-pointer
                          transition-colors rounded-md mx-2
                          ${isSelected ? 'bg-accent/20 border border-accent/30' : ''}
                        `}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-text-muted font-mono">
                              {result.line}:{result.column}
                            </span>
                          </div>
                          
                          <div className="text-sm text-text-primary font-mono leading-relaxed">
                            {highlightSearchTerm(result.preview, searchQuery)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyResultToClipboard(result)
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                            title="Copy"
                          >
                            <Copy size={12} className="text-text-muted" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onFileOpen?.(result.file, result.line)
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                            title="Open in Editor"
                          >
                            <ExternalLink size={12} className="text-text-muted" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
          </div>
        </CollapsibleSection>
      )}

      {/* No Results State */}
      {searchQuery && !isSearching && totalResults === 0 && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Search size={24} className="text-text-muted mx-auto mb-2" />
            <span className="text-sm text-text-muted">No results found</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPanel