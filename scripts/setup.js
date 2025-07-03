// VibeStudio Development Environment Setup
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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
  error: (msg) => console.log(`${chalk.red('❌')} ${msg}`),
  step: (msg) => console.log(`${chalk.cyan('🔄')} ${msg}`)
}

log.info('Setting up VibeStudio development environment...')

// Check Node.js version
const nodeVersion = process.versions.node
const majorVersion = parseInt(nodeVersion.split('.')[0])
if (majorVersion < 18) {
  log.error(`Node.js 18+ required. Current version: ${nodeVersion}`)
  process.exit(1)
}
log.success(`Node.js version: ${nodeVersion}`)

// Check if yarn is available
try {
  const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim()
  log.success(`Yarn version: ${yarnVersion}`)
} catch (error) {
  log.error('Yarn not found. Please install yarn: npm install -g yarn')
  process.exit(1)
}

// Create environment file if it doesn't exist
const envPath = '.env.local'
const envExamplePath = '.env.example'

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    log.success('Created .env.local from .env.example')
  } else {
    // Create a basic .env.local if .env.example doesn't exist
    const defaultEnv = `# VibeStudio Environment Configuration
VITE_APP_NAME=VibeStudio
VITE_APP_VERSION=0.1.0-beta
VITE_API_BASE_URL=http://localhost:3001/api
NODE_ENV=development
PORT=3001
`
    fs.writeFileSync(envPath, defaultEnv)
    log.success('Created default .env.local file')
  }
  log.warning('Please edit .env.local with your configuration')
} else {
  log.info('.env.local already exists')
}

// Install dependencies with yarn
log.step('Installing dependencies with yarn...')
try {
  execSync('yarn install', { stdio: 'inherit' })
  log.success('Dependencies installed successfully')
} catch (error) {
  log.error('Failed to install dependencies')
  log.error('Make sure yarn is installed: npm install -g yarn')
  process.exit(1)
}

// Create necessary directories
const dirs = [
  'src/core/editor',
  'src/core/explorer', 
  'src/core/terminal',
  'src/core/workbench',
  'src/ui/panels',
  'src/ui/sidebar',
  'src/ui/statusbar',
  'src/ui/themes',
  'src/ai/chat',
  'src/ai/providers',
  'src/shared/utils',
  'src/shared/types',
  'src/shared/constants',
  'src/shared/hooks',
  'server/routes',
  'server/middleware',
  'server/services',
  'server/config',
  'mcp-servers',
  'public/assets'
]

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    log.step(`Created directory: ${dir}`)
  }
})

log.success('Created directory structure')

// Make CLI executable
try {
  execSync('chmod +x cli/vibestudio.js', { stdio: 'pipe' })
  log.success('Made CLI tool executable')
} catch (error) {
  log.warning('Could not make CLI executable (this is OK on Windows)')
}

// Final setup message
console.log(`
${chalk.green('🎉 VibeStudio setup complete!')}`)
console.log('\nNext steps:')
console.log(`${chalk.gray('1.')} Edit .env.local with your configuration`)
console.log(`${chalk.gray('2.')} Run: ${chalk.cyan('yarn dev')} or ${chalk.cyan('npx vibestudio dev')}`)
console.log(`${chalk.gray('3.')} Open: ${chalk.cyan('http://localhost:3000')}`)
console.log('\nAvailable commands:')
console.log(`${chalk.cyan('yarn dev')} - Start development environment`)
console.log(`${chalk.cyan('yarn build')} - Build for production`)
console.log(`${chalk.cyan('yarn test')} - Run tests`)
console.log(`${chalk.cyan('npx vibestudio --help')} - Show CLI help`)
console.log(`\n${chalk.green('Happy coding!')} 🎯`)
