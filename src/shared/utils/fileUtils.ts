
export const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return '📄'
    case 'html':
    case 'htm':
      return '🌐'
    case 'css':
    case 'scss':
    case 'sass':
      return '🎨'
    case 'json':
      return '📋'
    case 'md':
    case 'markdown':
      return '📝'
    case 'py':
      return '🐍'
    case 'java':
      return '☕'
    case 'cpp':
    case 'c':
      return '⚙️'
    case 'go':
      return '🐹'
    case 'rs':
      return '🦀'
    case 'php':
      return '🐘'
    case 'rb':
      return '💎'
    case 'swift':
      return '🦉'
    case 'kt':
      return '🔺'
    case 'xml':
      return '📄'
    case 'yaml':
    case 'yml':
      return '📄'
    case 'txt':
      return '📄'
    case 'log':
      return '📜'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return '🖼️'
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return '🎬'
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return '🎵'
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return '📦'
    case 'pdf':
      return '📕'
    case 'doc':
    case 'docx':
      return '📄'
    case 'xls':
    case 'xlsx':
      return '📊'
    case 'ppt':
    case 'pptx':
      return '📈'
    default:
      return '📄'
  }
}

export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'js':
    case 'mjs':
      return 'javascript'
    case 'jsx':
      return 'javascriptreact'
    case 'ts':
      return 'typescript'
    case 'tsx':
      return 'typescriptreact'
    case 'html':
    case 'htm':
      return 'html'
    case 'css':
      return 'css'
    case 'scss':
      return 'scss'
    case 'sass':
      return 'sass'
    case 'json':
      return 'json'
    case 'md':
    case 'markdown':
      return 'markdown'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp'
    case 'c':
      return 'c'
    case 'go':
      return 'go'
    case 'rs':
      return 'rust'
    case 'php':
      return 'php'
    case 'rb':
      return 'ruby'
    case 'swift':
      return 'swift'
    case 'kt':
      return 'kotlin'
    case 'xml':
      return 'xml'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'sql':
      return 'sql'
    case 'sh':
    case 'bash':
      return 'shellscript'
    case 'ps1':
      return 'powershell'
    case 'dockerfile':
      return 'dockerfile'
    case 'vue':
      return 'vue'
    case 'svelte':
      return 'svelte'
    case 'r':
      return 'r'
    case 'pl':
      return 'perl'
    case 'lua':
      return 'lua'
    case 'dart':
      return 'dart'
    case 'elm':
      return 'elm'
    case 'clj':
    case 'cljs':
      return 'clojure'
    case 'fs':
    case 'fsx':
      return 'fsharp'
    case 'vb':
      return 'vb'
    case 'cs':
      return 'csharp'
    case 'ini':
    case 'cfg':
    case 'conf':
      return 'ini'
    case 'toml':
      return 'toml'
    case 'txt':
      return 'plaintext'
    case 'log':
      return 'plaintext'
    default:
      return 'plaintext'
  }
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
}

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename)
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)
}

export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename)
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)
}

export const isAudioFile = (filename: string): boolean => {
  const ext = getFileExtension(filename)
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext)
}

export const isArchiveFile = (filename: string): boolean => {
  const ext = getFileExtension(filename)
  return ['zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz'].includes(ext)
}

export const isCodeFile = (filename: string): boolean => {
  const ext = getFileExtension(filename)
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass',
    'json', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php', 'rb',
    'swift', 'kt', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash',
    'ps1', 'vue', 'svelte', 'r', 'pl', 'lua', 'dart', 'elm',
    'clj', 'cljs', 'fs', 'fsx', 'vb', 'cs'
  ]
  return codeExtensions.includes(ext)
}

export const generatePath = (parentPath: string, name: string): string => {
  if (parentPath === '' || parentPath === '/') {
    return name
  }
  return `${parentPath}/${name}`
}

export const getParentPath = (path: string): string => {
  const parts = path.split('/')
  if (parts.length <= 1) return ''
  return parts.slice(0, -1).join('/')
}

export const validateFileName = (name: string): { valid: boolean; error?: string } => {
  if (!name.trim()) {
    return { valid: false, error: 'Name cannot be empty' }
  }
  
  if (name.length > 255) {
    return { valid: false, error: 'Name too long (max 255 characters)' }
  }
  
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Name contains invalid characters' }
  }
  
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  if (reservedNames.includes(name.toUpperCase())) {
    return { valid: false, error: 'Reserved name not allowed' }
  }
  
  return { valid: true }
}

export const createDefaultFileContent = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const templates: { [key: string]: string } = {
    'tsx': `import React from 'react'

interface ${filename.replace('.tsx', '')}Props {
  // Define your props here
}

const ${filename.replace('.tsx', '')}: React.FC<${filename.replace('.tsx', '')}Props> = () => {
  return (
    <div>
      <h1>${filename.replace('.tsx', '')} Component</h1>
    </div>
  )
}

export default ${filename.replace('.tsx', '')}`,
    'ts': `// ${filename}
export interface ExampleInterface {
  id: number
  name: string
}

export const exampleFunction = (param: string): string => {
  return \`Hello, \${param}!\`
}`,
    'js': `// ${filename}
console.log("Hello from ${filename}!")

function exampleFunction(param) {
  return \`Hello, \${param}!\`
}

export { exampleFunction }`
  }
  
  return templates[ext || ''] || `// ${filename}\n\n// Start coding here...\n`
}