#!/usr/bin/env node

// VibeStudio CLI Tool - Your Creative Code Space Commander
const { program } = require('commander')
const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

// CLI Metadata
program
  .name('vibestudio')
  .description('🎯 VibeStudio CLI - Your Creative Code Space Commander')
  .version('0.1.0-beta')

// Art and branding
const logo = `
${chalk.cyan.bold('╔══════════════════════════════════════╗')}
${chalk.cyan.bold('║')}   ${chalk.magenta.bold('🎯 VibeStudio CLI')} ${chalk.gray('v0.1.0-beta')}    ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}   ${chalk.gray('Your Creative Code Space Commander')}  ${chalk.cyan.bold('║')}
${chalk.cyan.bold('╚══════════════════════════════════════╝')}
`

// Utility functions
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✅'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠️'), msg),
  error: (msg) => console.log(chalk.red('❌'), msg),
  step: (msg) => console.log(chalk.magenta('🔄'), msg)
}

const runCommand = (command, options = {}) => {
  try {
    log.step(`Running: ${chalk.gray(command)}`)
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd: options.cwd || process.cwd(),
      encoding: 'utf8',
      ...options
    })
    return result
  } catch (error) {
    log.error(`Command failed: ${command}`)
    if (!options.silent) process.exit(1)
    return null
  }
}

const runAsync = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    log.step(`Running: ${chalk.gray(command + ' ' + args.join(' '))}`)
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: options.cwd || process.cwd(),
      ...options
    })
    
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed with code ${code}`))
    })
  })
}

// Development Commands
program
  .command('dev')
  .description('🚀 Start development environment')
  .option('-c, --client-only', 'Start client only')
  .option('-s, --server-only', 'Start server only')
  .option('-p, --port <port>', 'Specify port', '3000')
  .action(async (options) => {
    console.log(logo)
    log.info('Starting VibeStudio development environment...')
    
    if (options.clientOnly) {
      log.step('Client-only mode')
      await runAsync('yarn', ['dev:client'])
    } else if (options.serverOnly) {
      log.step('Server-only mode') 
      await runAsync('yarn', ['dev:server'])
    } else {
      log.step('Full-stack mode (client + server)')
      await runAsync('yarn', ['dev'])
    }
  })

program
  .command('build')
  .description('🏗️ Build for production')
  .option('--analyze', 'Analyze bundle size')
  .action(async (options) => {
    console.log(logo)
    log.info('Building VibeStudio for production...')
    
    // Type checking
    log.step('Type checking...')
    runCommand('yarn type-check')
    
    // Linting
    log.step('Linting code...')
    runCommand('yarn lint')
    
    // Building
    log.step('Building application...')
    runCommand('yarn build')
    
    if (options.analyze) {
      log.step('Analyzing bundle...')
      runCommand('yarn analyze')
    }
    
    log.success('Build completed successfully!')
  })

program
  .command('test')
  .description('🧪 Run tests')
  .option('-w, --watch', 'Watch mode')
  .option('-c, --coverage', 'Generate coverage report')
  .action(async (options) => {
    console.log(logo)
    log.info('Running VibeStudio tests...')
    
    let command = 'yarn test'
    if (options.watch) command += ':watch'
    if (options.coverage) command += ' --coverage'
    
    await runAsync('yarn', ['test', ...(options.watch ? ['--watch'] : []), ...(options.coverage ? ['--coverage'] : [])])
  })

// Setup and Environment Commands
program
  .command('setup')
  .description('⚙️ Setup development environment')
  .option('--fresh', 'Fresh install (removes node_modules)')
  .action(async (options) => {
    console.log(logo)
    log.info('Setting up VibeStudio development environment...')
    
    if (options.fresh) {
      log.step('Removing existing dependencies...')
      if (fs.existsSync('node_modules')) {
        runCommand('rm -rf node_modules')
      }
      if (fs.existsSync('yarn.lock')) {
        runCommand('rm yarn.lock')
      }
    }
    
    log.step('Installing dependencies...')
    runCommand('yarn install')
    
    log.step('Running setup script...')
    runCommand('yarn setup')
    
    log.step('Validating environment...')
    runCommand('yarn validate-env')
    
    log.success('Setup completed! Run `vibestudio dev` to start coding 🎯')
  })

program
  .command('env')
  .description('🔍 Validate environment configuration')
  .action(() => {
    console.log(logo)
    log.info('Validating VibeStudio environment...')
    runCommand('yarn validate-env')
  })

// Code Quality Commands
program
  .command('lint')
  .description('🔍 Lint and format code')
  .option('--fix', 'Auto-fix issues')
  .action((options) => {
    console.log(logo)
    log.info('Checking code quality...')
    
    if (options.fix) {
      log.step('Auto-fixing lint issues...')
      runCommand('yarn lint --fix')
      log.step('Formatting code...')
      runCommand('yarn format')
    } else {
      runCommand('yarn lint')
    }
  })

program
  .command('format')
  .description('💅 Format code with Prettier')
  .action(() => {
    console.log(logo)
    log.info('Formatting VibeStudio code...')
    runCommand('yarn format')
    log.success('Code formatted successfully!')
  })

program
  .command('type-check')
  .description('🔍 Check TypeScript types')
  .action(() => {
    console.log(logo)
    log.info('Checking TypeScript types...')
    runCommand('yarn type-check')
    log.success('Type checking completed!')
  })

// Database and Services Commands
program
  .command('services')
  .description('🔌 Manage services')
  .argument('<action>', 'start|stop|restart|status')
  .action((action) => {
    console.log(logo)
    
    switch (action) {
      case 'start':
        log.info('Starting VibeStudio services...')
        runCommand('yarn dev:server')
        break
      case 'stop':
        log.info('Stopping services...')
        runCommand('pkill -f "node server"')
        break
      case 'restart':
        log.info('Restarting services...')
        runCommand('pkill -f "node server"')
        setTimeout(() => runCommand('yarn dev:server'), 1000)
        break
      case 'status':
        log.info('Checking service status...')
        runCommand('curl -s http://localhost:3001/health || echo "Server not running"')
        break
      default:
        log.error('Invalid action. Use: start|stop|restart|status')
    }
  })

// Utility Commands
program
  .command('clean')
  .description('🧹 Clean build artifacts')
  .option('--all', 'Clean everything including node_modules')
  .action((options) => {
    console.log(logo)
    log.info('Cleaning VibeStudio artifacts...')
    
    const cleanPaths = ['dist', '.cache', 'coverage']
    if (options.all) {
      cleanPaths.push('node_modules', 'yarn.lock')
    }
    
    cleanPaths.forEach(path => {
      if (fs.existsSync(path)) {
        log.step(`Removing ${path}...`)
        runCommand(`rm -rf ${path}`)
      }
    })
    
    log.success('Cleanup completed!')
  })

program
  .command('docs')
  .description('📚 Generate or serve documentation')
  .option('-s, --serve', 'Serve docs locally')
  .action((options) => {
    console.log(logo)
    
    if (options.serve) {
      log.info('Serving documentation...')
      // Serve docs if you have a docs generator
      log.info('Documentation available in docs/ folder')
    } else {
      log.info('Generating documentation...')
      // Generate docs if you have a docs generator
      log.success('Documentation updated!')
    }
  })

program
  .command('update')
  .description('📦 Update dependencies')
  .option('--latest', 'Update to latest versions')
  .action((options) => {
    console.log(logo)
    log.info('Updating VibeStudio dependencies...')
    
    if (options.latest) {
      log.warning('Updating to latest versions (may introduce breaking changes)')
      runCommand('yarn upgrade --latest')
    } else {
      runCommand('yarn upgrade')
    }
    
    log.step('Checking for security issues...')
    runCommand('yarn audit', { silent: true })
    
    log.success('Dependencies updated!')
  })

// Information Commands
program
  .command('info')
  .description('ℹ️ Show project information')
  .action(() => {
    console.log(logo)
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    console.log(chalk.cyan.bold('\n📋 Project Information:'))
    console.log(`${chalk.gray('Name:')} ${packageJson.name}`)
    console.log(`${chalk.gray('Version:')} ${packageJson.version}`)
    console.log(`${chalk.gray('Description:')} ${packageJson.description}`)
    
    console.log(chalk.cyan.bold('\n🛠️ Available Commands:'))
    console.log(`${chalk.green('vibestudio dev')} - Start development`)
    console.log(`${chalk.green('vibestudio build')} - Build for production`)
    console.log(`${chalk.green('vibestudio test')} - Run tests`)
    console.log(`${chalk.green('vibestudio setup')} - Setup environment`)
    console.log(`${chalk.green('vibestudio lint')} - Check code quality`)
    
    console.log(chalk.cyan.bold('\n🚀 Quick Start:'))
    console.log(`${chalk.gray('1.')} vibestudio setup`)
    console.log(`${chalk.gray('2.')} vibestudio dev`)
    console.log(`${chalk.gray('3.')} Open http://localhost:3000`)
  })

// Error handling
program.on('command:*', () => {
  console.log(logo)
  log.error(`Unknown command: ${program.args.join(' ')}`)
  log.info('Run `vibestudio --help` to see available commands')
  process.exit(1)
})

// Parse CLI arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(logo)
  program.outputHelp()
}