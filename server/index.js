// VibeStudio Backend Server - Enhanced Edition
const express = require('express')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // Monaco editor needs unsafe-eval
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}))

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://vibestudio.online', 'https://www.vibestudio.online']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// General middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// Health check with detailed info
app.get('/health', (req, res) => {
  const healthInfo = {
    status: 'healthy',
    service: 'VibeStudio API',
    version: '0.1.0-beta',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: process.memoryUsage(),
    endpoints: {
      api: '/api',
      health: '/health',
      metrics: '/metrics'
    }
  }
  res.json(healthInfo)
})

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.version,
    platform: process.platform
  })
})

// API routes
app.use('/api', require('./routes/api'))
app.use('/api/files', require('./routes/files'))
app.use('/api/git', require('./routes/git'))
app.use('/api/ai', require('./routes/ai'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack)
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 VibeStudio server running on port ${PORT}`)
  console.log(`📊 Environment: ${NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`🎯 API endpoint: http://localhost:${PORT}/api`)
})

module.exports = { app, server }
