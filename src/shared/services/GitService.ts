// Git Service for Source Control Operations
// Note: Using mock data for web development

export interface GitStatus {
  isRepo: boolean
  branch: string
  ahead: number
  behind: number
  changes: GitChange[]
  staged: GitChange[]
  untracked: string[]
}

export interface GitChange {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unmerged'
  staged: boolean
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: Date
  refs?: string[]
}

export interface GitBranch {
  name: string
  current: boolean
  remote?: string
}

export class GitService {
  private static instance: GitService
  private currentRepo: string = ''

  static getInstance(): GitService {
    if (!GitService.instance) {
      GitService.instance = new GitService()
    }
    return GitService.instance
  }

  async getStatus(): Promise<GitStatus> {
    // For web development, use mock data
    return this.getMockGitStatus()
  }

  async getBranches(): Promise<GitBranch[]> {
    // For web development, use mock data
    return this.getMockBranches()
  }

  async getCommits(): Promise<GitCommit[]> {
    // For web development, use mock data
    return this.getMockCommits()
  }

  async stageFile(filePath: string): Promise<void> {
    // Mock implementation - stage file: ${filePath}
    void filePath
  }

  async unstageFile(filePath: string): Promise<void> {
    // Mock implementation - unstage file: ${filePath}
    void filePath
  }

  async commit(message: string): Promise<void> {
    // Mock implementation - commit: ${message}
    void message
  }

  async push(remote = 'origin', branch?: string): Promise<void> {
    // Mock implementation - push to: ${remote} ${branch || 'current branch'}
    void remote
    void branch
  }

  async pull(remote = 'origin', branch?: string): Promise<void> {
    // Mock implementation - pull from: ${remote} ${branch || 'current branch'}
    void remote
    void branch
  }

  async createBranch(name: string): Promise<void> {
    // Mock implementation - create branch: ${name}
    void name
  }

  async switchBranch(name: string): Promise<void> {
    // Mock implementation - switch to branch: ${name}
    void name
  }


  private getMockGitStatus(): GitStatus {
    return {
      isRepo: true,
      branch: 'main',
      ahead: 0,
      behind: 0,
      changes: [
        { path: 'src/App.tsx', status: 'modified', staged: false },
        { path: 'src/ui/sidebar/ActivityBarFinal.tsx', status: 'modified', staged: false },
        { path: 'src/shared/services/FileSystemService.ts', status: 'added', staged: true }
      ],
      staged: [
        { path: 'src/shared/services/FileSystemService.ts', status: 'added', staged: true }
      ],
      untracked: [
        'src/shared/services/GitService.ts'
      ]
    }
  }

  private getMockBranches(): GitBranch[] {
    return [
      { name: 'main', current: true },
      { name: 'feature/file-explorer', current: false },
      { name: 'feature/search-functionality', current: false }
    ]
  }

  private getMockCommits(): GitCommit[] {
    return [
      {
        hash: 'a1b2c3d',
        message: 'Add file system service for real file operations',
        author: 'Developer',
        date: new Date(),
        refs: ['HEAD', 'main']
      },
      {
        hash: 'e4f5g6h',
        message: 'Clean up and consolidate ActivityBar components',
        author: 'Developer',
        date: new Date(Date.now() - 3600000),
      },
      {
        hash: 'i7j8k9l',
        message: 'Implement smooth animations for UI components',
        author: 'Developer',
        date: new Date(Date.now() - 7200000),
      }
    ]
  }

  setCurrentRepo(path: string): void {
    this.currentRepo = path
  }

  getCurrentRepo(): string {
    return this.currentRepo
  }
}

export default GitService.getInstance()