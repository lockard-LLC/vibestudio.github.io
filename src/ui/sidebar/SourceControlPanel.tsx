// Modern Source Control Panel Component
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  GitBranch as GitBranchIcon, 
  GitCommit as GitCommitIcon, 
  RefreshCw,
  Plus, 
  Minus, 
  Circle, 
  CheckCircle,
  Upload, 
  Download, 
  Edit3
} from 'lucide-react'
import GitService, { GitStatus, GitBranch, GitCommit } from '../../shared/services/GitService'

interface SourceControlPanelProps {
  onFileOpen?: (filePath: string) => void
}

interface CommitState {
  message: string
  isCommitting: boolean
}

// Component constants
const MAX_COMMIT_MESSAGE_LENGTH = 72
const MAX_DISPLAYED_COMMITS = 8
const CARD_CLASSES = 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden'
const BUTTON_CLASSES = 'transition-all duration-300 hover:scale-110'

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({ onFileOpen }) => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [branches, setBranches] = useState<GitBranch[]>([])
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [showBranches, setShowBranches] = useState(false)
  const [commitState, setCommitState] = useState<CommitState>({
    message: '',
    isCommitting: false
  })

  const commitMessageRef = useRef<HTMLTextAreaElement>(null)

  const loadGitData = useCallback(async () => {
    try {
      setLoading(true)
      const [status, branchList, commitList] = await Promise.all([
        GitService.getStatus(),
        GitService.getBranches(),
        GitService.getCommits()
      ])
      
      setGitStatus(status)
      setBranches(branchList)
      setCommits(commitList)
    } catch (error) {
      console.error('Failed to load git data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGitData()
  }, [loadGitData])

  // Git operation handlers
  const handleStageFile = useCallback(async (filePath: string) => {
    try {
      await GitService.stageFile(filePath)
      await loadGitData()
    } catch (error) {
      console.error('Failed to stage file:', error)
    }
  }, [loadGitData])

  const handleUnstageFile = useCallback(async (filePath: string) => {
    try {
      await GitService.unstageFile(filePath)
      await loadGitData()
    } catch (error) {
      console.error('Failed to unstage file:', error)
    }
  }, [loadGitData])

  const handleCommit = useCallback(async () => {
    if (!commitState.message.trim() || !gitStatus?.staged.length) return

    try {
      setCommitState(prev => ({ ...prev, isCommitting: true }))
      await GitService.commit(commitState.message)
      setCommitState({ message: '', isCommitting: false })
      await loadGitData()
    } catch (error) {
      console.error('Failed to commit:', error)
      setCommitState(prev => ({ ...prev, isCommitting: false }))
    }
  }, [commitState.message, gitStatus?.staged.length, loadGitData])

  const handlePush = useCallback(async () => {
    try {
      await GitService.push()
      await loadGitData()
    } catch (error) {
      console.error('Failed to push:', error)
    }
  }, [loadGitData])

  const handlePull = useCallback(async () => {
    try {
      await GitService.pull()
      await loadGitData()
    } catch (error) {
      console.error('Failed to pull:', error)
    }
  }, [loadGitData])

  const handleSwitchBranch = useCallback(async (branchName: string) => {
    try {
      await GitService.switchBranch(branchName)
      await loadGitData()
      setShowBranches(false)
    } catch (error) {
      console.error('Failed to switch branch:', error)
    }
  }, [loadGitData])

  // Utility functions with memoized constants
  const getStatusIcon = useCallback((status: string) => {
    const STATUS_ICONS = {
      modified: <Circle size={12} className="text-warning fill-current" />,
      added: <Plus size={12} className="text-success" />,
      deleted: <Minus size={12} className="text-error" />,
      renamed: <Edit3 size={12} className="text-info" />,
      default: <Circle size={12} className="text-text-muted" />
    } as const
    return STATUS_ICONS[status as keyof typeof STATUS_ICONS] || STATUS_ICONS.default
  }, [])

  const getStatusText = useCallback((status: string) => {
    const STATUS_TEXT = {
      modified: 'M',
      added: 'A',
      deleted: 'D',
      renamed: 'R',
      copied: 'C',
      unmerged: 'U',
      default: '?'
    } as const
    return STATUS_TEXT[status as keyof typeof STATUS_TEXT] || STATUS_TEXT.default
  }, [])

  const formatCommitDate = useCallback((date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }, [])

  // Computed values
  const currentBranch = branches.find(b => b.current)
  const totalChanges = (gitStatus?.changes.length || 0) + (gitStatus?.untracked.length || 0)
  const stagedCount = gitStatus?.staged.length || 0
  const hasChanges = totalChanges > 0 || stagedCount > 0

  // Loading state component
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 bg-blue-100/60 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw size={20} className="animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Loading Repository</h3>
          <p className="text-xs text-slate-500 dark:text-slate-500">Fetching git status and history...</p>
        </div>
      </div>
    )
  }

  // No repository state component
  if (!gitStatus?.isRepo) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className={`${CARD_CLASSES} w-full max-w-sm`}>
          <div className="bg-gradient-to-r from-slate-500 to-gray-500 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GitBranchIcon size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">No Repository</h3>
                <p className="text-xs text-slate-200">Initialize git to get started</p>
              </div>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-slate-100/60 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GitBranchIcon size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">No git repository found in this workspace</p>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-[1.02] shadow-lg">
              Initialize Repository
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50/80 to-slate-100/60 dark:from-slate-900/80 dark:to-slate-800/60">
      {/* Modern Header Card */}
      <div className="m-3 mb-4">
        <div className={`${CARD_CLASSES} shadow-xl`}>
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <GitBranchIcon size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Git Repository</h2>
                  <p className="text-xs text-orange-100">Source Control</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadGitData}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm ${BUTTON_CLASSES} group`}
                  title="Refresh Repository"
                >
                  <RefreshCw size={14} className="text-white group-hover:rotate-180 transition-transform duration-500" />
                </button>
                
                <button
                  onClick={() => setShowBranches(!showBranches)}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm ${BUTTON_CLASSES}`}
                  title="Switch Branch"
                >
                  <GitBranchIcon size={14} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Branch Info Card */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl flex items-center justify-center">
                  <GitBranchIcon size={16} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {currentBranch?.name || 'main'}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active branch</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {gitStatus.ahead > 0 && (
                  <button
                    onClick={handlePush}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
                    title={`Push ${gitStatus.ahead} commit${gitStatus.ahead !== 1 ? 's' : ''}`}
                  >
                    <Upload size={10} className="inline mr-1" />
                    {gitStatus.ahead}
                  </button>
                )}
                
                {gitStatus.behind > 0 && (
                  <button
                    onClick={handlePull}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
                    title={`Pull ${gitStatus.behind} commit${gitStatus.behind !== 1 ? 's' : ''}`}
                  >
                    <Download size={10} className="inline mr-1" />
                    {gitStatus.behind}
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-cyan-200/40 dark:border-cyan-700/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-cyan-700 dark:text-cyan-400">{totalChanges}</p>
                    <p className="text-xs text-cyan-600 dark:text-cyan-500 font-medium">Modified</p>
                  </div>
                  <div className="w-8 h-8 bg-cyan-200/60 dark:bg-cyan-800/60 rounded-lg flex items-center justify-center">
                    <Circle size={14} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-3 border border-emerald-200/40 dark:border-emerald-700/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{stagedCount}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Staged</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-200/60 dark:bg-emerald-800/60 rounded-lg flex items-center justify-center">
                    <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Branch Selector */}
      {showBranches && (
        <div className="mx-3 mb-4">
          <div className={CARD_CLASSES}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3">
              <h3 className="text-sm font-bold text-white">Switch Branch</h3>
            </div>
            <div className="p-3 space-y-2">
              {branches.map(branch => (
                <div
                  key={branch.name}
                  className={`
                    flex items-center justify-between p-3 rounded-xl cursor-pointer
                    transition-all duration-300 hover:scale-[1.02]
                    ${branch.current 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border border-purple-200/60 dark:border-purple-700/60' 
                      : 'bg-slate-50/80 dark:bg-slate-700/80 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20'
                    }
                  `}
                  onClick={() => !branch.current && handleSwitchBranch(branch.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      branch.current ? 'bg-purple-200/60 dark:bg-purple-800/60' : 'bg-slate-200/60 dark:bg-slate-600/60'
                    }`}>
                      <GitBranchIcon size={14} className={branch.current ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'} />
                    </div>
                    <span className={`text-sm font-medium ${
                      branch.current ? 'text-purple-800 dark:text-purple-200' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {branch.name}
                    </span>
                  </div>
                  {branch.current && (
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {/* Modern Commit Card */}
        {stagedCount > 0 && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <GitCommitIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ready to Commit</h3>
                    <p className="text-xs text-teal-100">{stagedCount} files staged</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-teal-400/30 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{stagedCount}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="relative">
                <textarea
                  ref={commitMessageRef}
                  placeholder="Enter your commit message..."
                  value={commitState.message}
                  onChange={(e) => {
                    const message = e.target.value
                    if (message.length <= MAX_COMMIT_MESSAGE_LENGTH) {
                      setCommitState(prev => ({ ...prev, message }))
                    }
                  }}
                  className="w-full px-4 py-4 bg-gradient-to-br from-teal-50/80 to-cyan-50/60 dark:from-teal-900/20 dark:to-cyan-900/15 border border-teal-200/60 dark:border-teal-700/40 rounded-xl resize-none text-sm text-slate-700 dark:text-slate-300 placeholder-teal-400/70 dark:placeholder-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/80 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 shadow-sm backdrop-blur-sm"
                  rows={3}
                  maxLength={MAX_COMMIT_MESSAGE_LENGTH}
                />
                <div className={`absolute bottom-2 right-2 text-xs transition-colors ${
                  commitState.message.length > MAX_COMMIT_MESSAGE_LENGTH * 0.8 
                    ? 'text-amber-500 dark:text-amber-400' 
                    : 'text-teal-500/60 dark:text-teal-400/60'
                }`}>
                  {commitState.message.length}/{MAX_COMMIT_MESSAGE_LENGTH}
                </div>
              </div>
              
              <button
                onClick={handleCommit}
                disabled={!commitState.message.trim() || commitState.isCommitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-teal-500/25 border border-teal-400/30"
              >
                {commitState.isCommitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Committing changes...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <GitCommitIcon size={16} />
                    <span>Commit {stagedCount} file{stagedCount !== 1 ? 's' : ''}</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Modern Staged Changes Card */}
        {stagedCount > 0 && (
          <div className={CARD_CLASSES}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Staged Changes</h3>
                    <p className="text-xs text-green-100">Ready for commit</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-400/30 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{stagedCount}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {gitStatus.staged.map((change, index) => (
                <div
                  key={index}
                  className="
                    flex items-center justify-between p-3
                    bg-gradient-to-r from-green-50/60 to-emerald-50/40
                    dark:from-green-900/20 dark:to-emerald-900/15
                    rounded-xl transition-all duration-300 group 
                    border border-green-200/40 dark:border-green-700/30
                    hover:shadow-md hover:scale-[1.02] hover:border-green-300/60 dark:hover:border-green-600/50
                  "
                >
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => onFileOpen?.(change.path)}
                  >
                    <div className="w-8 h-8 bg-green-200/60 dark:bg-green-800/60 rounded-lg flex items-center justify-center">
                      {getStatusIcon(change.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate block group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                        {change.path.split('/').pop()}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-mono">
                        {change.path.includes('/') ? change.path.substring(0, change.path.lastIndexOf('/')) : ''}
                      </span>
                    </div>
                    <div className="bg-green-200/80 dark:bg-green-800/80 px-2 py-1 rounded-lg">
                      <span className="text-xs text-green-700 dark:text-green-300 font-mono font-bold">
                        {getStatusText(change.status)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleUnstageFile(change.path)}
                    className="
                      w-8 h-8 flex items-center justify-center rounded-lg ml-3
                      bg-red-100/80 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60
                      border border-red-200/60 dark:border-red-700/60
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      hover:scale-110 hover:shadow-lg
                    "
                    title="Unstage"
                  >
                    <Minus size={14} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modern Changes Card */}
        {totalChanges > 0 && (
          <div className={CARD_CLASSES}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Circle size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Modified Files</h3>
                    <p className="text-xs text-amber-100">Pending changes</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-amber-400/30 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{totalChanges}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {gitStatus.changes.filter(change => !change.staged).map((change, index) => (
                <div
                  key={index}
                  className="
                    flex items-center justify-between p-3
                    bg-gradient-to-r from-amber-50/60 to-orange-50/40
                    dark:from-amber-900/20 dark:to-orange-900/15
                    rounded-xl transition-all duration-300 group 
                    border border-amber-200/40 dark:border-amber-700/30
                    hover:shadow-md hover:scale-[1.02] hover:border-amber-300/60 dark:hover:border-amber-600/50
                  "
                >
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => onFileOpen?.(change.path)}
                  >
                    <div className="w-8 h-8 bg-amber-200/60 dark:bg-amber-800/60 rounded-lg flex items-center justify-center">
                      {getStatusIcon(change.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate block group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                        {change.path.split('/').pop()}
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                        {change.path.includes('/') ? change.path.substring(0, change.path.lastIndexOf('/')) : ''}
                      </span>
                    </div>
                    <div className="bg-amber-200/80 dark:bg-amber-800/80 px-2 py-1 rounded-lg">
                      <span className="text-xs text-amber-700 dark:text-amber-300 font-mono font-bold">
                        {getStatusText(change.status)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStageFile(change.path)}
                    className="
                      w-8 h-8 flex items-center justify-center rounded-lg ml-3
                      bg-green-100/80 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-800/60
                      border border-green-200/60 dark:border-green-700/60
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      hover:scale-110 hover:shadow-lg
                    "
                    title="Stage"
                  >
                    <Plus size={14} className="text-green-600 dark:text-green-400" />
                  </button>
                </div>
              ))}
              
              {gitStatus.untracked.map((filePath, index) => (
                <div
                  key={`untracked-${index}`}
                  className="
                    flex items-center justify-between p-3
                    bg-gradient-to-r from-violet-50/60 to-purple-50/40
                    dark:from-violet-900/20 dark:to-purple-900/15
                    rounded-xl transition-all duration-300 group 
                    border border-violet-200/40 dark:border-violet-700/30
                    hover:shadow-md hover:scale-[1.02] hover:border-violet-300/60 dark:hover:border-violet-600/50
                  "
                >
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => onFileOpen?.(filePath)}
                  >
                    <div className="w-8 h-8 bg-violet-200/60 dark:bg-violet-800/60 rounded-lg flex items-center justify-center">
                      <Circle size={14} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate block group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                        {filePath.split('/').pop()}
                      </span>
                      <span className="text-xs text-violet-600 dark:text-violet-400 font-mono">Untracked</span>
                    </div>
                    <div className="bg-violet-200/80 dark:bg-violet-800/80 px-2 py-1 rounded-lg">
                      <span className="text-xs text-violet-700 dark:text-violet-300 font-mono font-bold">U</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStageFile(filePath)}
                    className="
                      w-8 h-8 flex items-center justify-center rounded-lg ml-3
                      bg-green-100/80 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-800/60
                      border border-green-200/60 dark:border-green-700/60
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      hover:scale-110 hover:shadow-lg
                    "
                    title="Stage"
                  >
                    <Plus size={14} className="text-green-600 dark:text-green-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modern Recent Commits Card */}
        <div className={CARD_CLASSES}>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <GitCommitIcon size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Recent Commits</h3>
                  <p className="text-xs text-indigo-100">Project history</p>
                </div>
              </div>
              <div className="w-8 h-8 bg-indigo-400/30 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white">{commits.length}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 max-h-64 overflow-y-auto space-y-3">
            {commits.slice(0, MAX_DISPLAYED_COMMITS).map((commit) => (
              <div
                key={commit.hash}
                className="
                  p-3 bg-gradient-to-r from-indigo-50/60 to-purple-50/40
                  dark:from-indigo-900/20 dark:to-purple-900/15
                  rounded-xl transition-all duration-300 group 
                  border border-indigo-200/40 dark:border-indigo-700/30
                  hover:shadow-md hover:scale-[1.02] hover:border-indigo-300/60 dark:hover:border-indigo-600/50
                "
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-200/60 dark:bg-indigo-800/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GitCommitIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      {commit.message}
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="bg-indigo-200/80 dark:bg-indigo-800/80 px-2 py-1 rounded-lg">
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                          {commit.hash.substring(0, 7)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {commit.author}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {formatCommitDate(commit.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {commits.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-indigo-100/60 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GitCommitIcon size={20} className="text-indigo-400 dark:text-indigo-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">No commits yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Modern Empty State */}
        {!hasChanges && (
          <div className={CARD_CLASSES}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">All Clean</h3>
                  <p className="text-xs text-emerald-100">Working tree clean</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">No pending changes</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Your working directory is clean and up to date</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SourceControlPanel