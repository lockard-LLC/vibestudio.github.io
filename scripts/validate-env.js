// VibeStudio Environment Validation
const fs = require('fs')
const path = require('path')

const chalk = {
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
}

const log = {
  info: (msg) => console.log(`${chalk.cyan('ℹ️')} ${msg}`),
  success: (msg) => console.log(`${chalk.green('✅')} ${msg}`),
  warning: (msg) => console.log(`${chalk.yellow('⚠️')} ${msg}`),
  error: (msg) => console.log(`${chalk.red('❌')} ${msg}`)
}

log.info('Validating VibeStudio environment...')

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local')
if (!fs.existsSync(envPath)) {
  log.error('.env.local not found')
  log.info('Run: yarn setup to create environment file')
  process.exit(1)
}
log.success('.env.local file found')

// Read environment file
const envContent = fs.readFileSync(envPath, 'utf8')
const requiredVars = [
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
  'VITE_API_BASE_URL',
  'NODE_ENV'
]

let missing = []
requiredVars.forEach(varName => {
  if (!envContent.includes(varName + '=') || envContent.includes(varName + '=your_')) {
    missing.push(varName)
  }
})

// Additional validations
const nodeVersion = process.versions.node
const majorVersion = parseInt(nodeVersion.split('.')[0])
if (majorVersion < 18) {
  log.error(`Node.js 18+ required. Current: ${nodeVersion}`)
  missing.push('NODE_VERSION')
}

// Check yarn availability
try {
  require('child_process').execSync('yarn --version', { stdio: 'pipe' })
  log.success('Yarn is available')
} catch (error) {
  log.warning('Yarn not found, using npm as fallback')
}

// Check if key directories exist
const keyDirs = ['src', 'server', 'cli', 'docs', 'scripts']
keyDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    log.success(`Directory ${dir}/ exists`)
  } else {
    log.warning(`Directory ${dir}/ missing`)
  }
})

if (missing.length > 0) {
  log.error('Missing or invalid environment variables:')
  missing.forEach(v => console.log(`   ${chalk.red('-')} ${v}`))
  log.info('Edit .env.local to fix these issues')
  process.exit(1)
}

log.success('Environment configuration is valid!')
log.info('Ready to start development with: yarn dev')
