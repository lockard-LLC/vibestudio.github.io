// VibeStudio File Management API
const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const path = require('path')
const { body, param, validationResult } = require('express-validator')

// Security: Prevent path traversal
const sanitizePath = (filePath) => {
  return path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '')
}

// List directory contents
router.get('/ls', async (req, res) => {
  try {
    const { dir = '.' } = req.query
    const safePath = sanitizePath(dir)
    
    const items = await fs.readdir(safePath, { withFileTypes: true })
    const result = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(safePath, item.name)
        const stats = await fs.stat(itemPath)
        
        return {
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime,
          path: itemPath
        }
      })
    )
    
    res.json({
      path: safePath,
      items: result.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to read directory', 
      message: error.message 
    })
  }
})

// Read file content
router.get('/read/:path(*)', [
  param('path').notEmpty().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const filePath = sanitizePath(req.params.path)
    const content = await fs.readFile(filePath, 'utf8')
    const stats = await fs.stat(filePath)
    
    res.json({
      path: filePath,
      content,
      size: stats.size,
      modified: stats.mtime,
      encoding: 'utf8'
    })
  } catch (error) {
    res.status(404).json({ 
      error: 'File not found', 
      message: error.message 
    })
  }
})

// Write file content
router.post('/write/:path(*)', [
  param('path').notEmpty().escape(),
  body('content').notEmpty().isString(),
  body('encoding').optional().isIn(['utf8', 'base64'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const filePath = sanitizePath(req.params.path)
    const { content, encoding = 'utf8' } = req.body
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    
    await fs.writeFile(filePath, content, encoding)
    const stats = await fs.stat(filePath)
    
    res.json({
      message: 'File written successfully',
      path: filePath,
      size: stats.size,
      modified: stats.mtime
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to write file', 
      message: error.message 
    })
  }
})

// Create directory
router.post('/mkdir/:path(*)', [
  param('path').notEmpty().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const dirPath = sanitizePath(req.params.path)
    await fs.mkdir(dirPath, { recursive: true })
    
    res.json({
      message: 'Directory created successfully',
      path: dirPath
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create directory', 
      message: error.message 
    })
  }
})

// Delete file or directory
router.delete('/rm/:path(*)', [
  param('path').notEmpty().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const itemPath = sanitizePath(req.params.path)
    const stats = await fs.stat(itemPath)
    
    if (stats.isDirectory()) {
      await fs.rmdir(itemPath, { recursive: true })
    } else {
      await fs.unlink(itemPath)
    }
    
    res.json({
      message: `${stats.isDirectory() ? 'Directory' : 'File'} deleted successfully`,
      path: itemPath
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete item', 
      message: error.message 
    })
  }
})

// Rename/move file or directory
router.put('/mv/:path(*)', [
  param('path').notEmpty().escape(),
  body('newPath').notEmpty().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const oldPath = sanitizePath(req.params.path)
    const newPath = sanitizePath(req.body.newPath)
    
    await fs.rename(oldPath, newPath)
    
    res.json({
      message: 'Item moved successfully',
      oldPath,
      newPath
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to move item', 
      message: error.message 
    })
  }
})

// File search
router.get('/search', async (req, res) => {
  try {
    const { query, dir = '.', extension } = req.query
    
    if (!query) {
      return res.status(400).json({ error: 'Search query required' })
    }
    
    // This is a basic implementation - in production you'd want
    // to use a proper search library like ripgrep or similar
    const results = []
    
    res.json({
      query,
      directory: dir,
      results,
      message: 'File search functionality coming soon'
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    })
  }
})

module.exports = router