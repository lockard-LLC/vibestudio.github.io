// VibeStudio Git Integration API
const express = require('express')
const router = express.Router()
const { execSync, spawn } = require('child_process')
const { body, validationResult } = require('express-validator')

// Utility function to run git commands safely
const runGitCommand = (command, options = {}) => {
  try {
    const result = execSync(`git ${command}`, {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
      timeout: options.timeout || 10000
    })
    return { success: true, output: result.trim() }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      stderr: error.stderr?.toString() || ''
    }
  }
}

// Git status
router.get('/status', (req, res) => {
  const result = runGitCommand('status --porcelain')
  
  if (!result.success) {
    return res.status(500).json({
      error: 'Failed to get git status',
      message: result.error
    })
  }
  
  // Parse status output
  const lines = result.output.split('\n').filter(line => line.trim())
  const files = lines.map(line => {
    const status = line.substring(0, 2)
    const path = line.substring(3)
    
    return {
      path,
      status: {
        index: status[0],
        workingTree: status[1]
      },
      staged: status[0] !== ' ' && status[0] !== '?',
      modified: status[1] !== ' ',
      untracked: status === '??'
    }
  })
  
  res.json({
    isRepo: true,
    clean: files.length === 0,
    files,
    branch: getCurrentBranch()
  })
})

// Get current branch
const getCurrentBranch = () => {
  const result = runGitCommand('branch --show-current')
  return result.success ? result.output : 'main'
}

// List branches
router.get('/branches', (req, res) => {
  const result = runGitCommand('branch -a')
  
  if (!result.success) {
    return res.status(500).json({
      error: 'Failed to get branches',
      message: result.error
    })
  }
  
  const branches = result.output
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('remotes/origin/HEAD'))
    .map(line => ({
      name: line.replace(/^\*\s+/, '').replace(/^remotes\/origin\//, ''),
      current: line.startsWith('*'),
      remote: line.startsWith('remotes/')
    }))
  
  res.json({ branches })
})

// Get commit history
router.get('/commits', (req, res) => {
  const { limit = 20 } = req.query
  const result = runGitCommand(`log --oneline -${limit} --format="%H|%an|%ad|%s" --date=iso`)
  
  if (!result.success) {
    return res.status(500).json({
      error: 'Failed to get commit history',
      message: result.error
    })
  }
  
  const commits = result.output
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [hash, author, date, message] = line.split('|')
      return {
        hash,
        author,
        date: new Date(date),
        message
      }
    })
  
  res.json({ commits })
})

// Stage files
router.post('/add', [
  body('files').isArray().notEmpty(),
  body('files.*').isString()
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  
  const { files } = req.body
  const filesArg = files.map(f => `"${f}"`).join(' ')
  const result = runGitCommand(`add ${filesArg}`)
  
  if (!result.success) {
    return res.status(500).json({
      error: 'Failed to stage files',
      message: result.error
    })
  }
  
  res.json({
    message: 'Files staged successfully',
    files
  })
})

module.exports = router