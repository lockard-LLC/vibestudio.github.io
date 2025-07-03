// src/core/editor/MonacoEditor.tsx
import React, { useRef } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import { useTheme } from '../../shared/hooks/useTheme'
import * as monaco from 'monaco-editor'

interface MonacoEditorProps {
  value: string
  language: string
  onChange?: (value: string) => void
  onMount?: OnMount
  readOnly?: boolean
  minimap?: boolean
  lineNumbers?: boolean
  wordWrap?: boolean
  fontSize?: number
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  onChange,
  onMount,
  readOnly = false,
  minimap = true,
  lineNumbers = true,
  wordWrap = false,
  fontSize = 14
}) => {
  const { theme } = useTheme()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
      fontLigatures: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      mouseWheelScrollSensitivity: 2,
      fastScrollSensitivity: 5,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'gutter',
      selectionHighlight: true,
      occurrencesHighlight: 'singleFile',
      codeLens: true,
      folding: true,
      foldingHighlight: true,
      showFoldingControls: 'mouseover',
      matchBrackets: 'always',
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'quotes',
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      trimAutoWhitespace: true,
      dragAndDrop: true,
      links: true,
      colorDecorators: true,
      contextmenu: true,
      mouseWheelZoom: true,
      multiCursorModifier: 'ctrlCmd',
      accessibilitySupport: 'auto',
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      parameterHints: {
        enabled: true,
        cycle: true
      },
      hover: {
        enabled: true,
        delay: 300,
        sticky: true
      }
    })

    // Custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // TODO: Implement save functionality
      void 0
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      // TODO: Implement file search functionality
      void 0
    })

    // Call the provided onMount callback
    if (onMount) {
      onMount(editor, monaco)
    }
  }

  const handleEditorChange: OnChange = (value) => {
    if (onChange && value !== undefined) {
      onChange(value)
    }
  }

  // Configure theme
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light'

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={editorTheme}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={{
        readOnly,
        minimap: { enabled: minimap },
        lineNumbers: lineNumbers ? 'on' : 'off',
        wordWrap: wordWrap ? 'on' : 'off',
        fontSize,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        bracketPairColorization: {
          enabled: true
        }
      }}
      loading={
        <div className="flex items-center justify-center h-full">
          <div className="text-text-secondary">Loading editor...</div>
        </div>
      }
    />
  )
}
