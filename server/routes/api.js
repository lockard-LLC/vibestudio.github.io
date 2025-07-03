// VibeStudio Core API Routes
const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')

// API Information
router.get('/', (req, res) => {
  res.json({
    name: 'VibeStudio API',
    version: '0.1.0-beta',
    tagline: 'Your Creative Code Space',
    description: 'Modern web-based IDE with AI integration',
    documentation: 'https://docs.vibestudio.online',
    endpoints: {
      files: '/api/files',
      git: '/api/git', 
      ai: '/api/ai',
      health: '/health',
      metrics: '/metrics'
    },
    features: [
      'File Management',
      'Git Integration',
      'AI-Powered Assistance',
      'Real-time Collaboration',
      'Monaco Editor',
      'Terminal Integration'
    ]
  })
})

// System status
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    services: {
      api: 'healthy',
      fileSystem: 'healthy',
      git: 'healthy',
      ai: 'healthy'
    },
    timestamp: new Date().toISOString()
  })
})

// Configuration endpoint
router.get('/config', (req, res) => {
  res.json({
    editor: {
      defaultTheme: 'vs-dark',
      fontSize: 14,
      wordWrap: 'on',
      minimap: { enabled: true }
    },
    terminal: {
      shell: process.platform === 'win32' ? 'powershell' : 'bash',
      fontSize: 12
    },
    ai: {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 2048
    }
  })
})

// User preferences (mock for now)
router.get('/preferences', (req, res) => {
  res.json({
    theme: 'dark',
    language: 'en',
    autoSave: true,
    wordWrap: true,
    minimap: true,
    fontSize: 14,
    fontFamily: 'Fira Code',
    tabSize: 2,
    insertSpaces: true
  })
})

router.put('/preferences', [
  body('theme').optional().isIn(['light', 'dark']),
  body('fontSize').optional().isInt({ min: 8, max: 32 }),
  body('tabSize').optional().isInt({ min: 1, max: 8 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  
  // In a real app, save to database
  res.json({ 
    message: 'Preferences updated successfully',
    preferences: req.body
  })
})

// Error handling for this router
router.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({
    error: 'Internal API Error',
    message: err.message,
    timestamp: new Date().toISOString()
  })
})

module.exports = router
