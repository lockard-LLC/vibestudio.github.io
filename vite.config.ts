// vite.config.ts (Updated for Monaco Editor)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/ui': path.resolve(__dirname, './src/ui'),
      '@/ai': path.resolve(__dirname, './src/ai'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          monaco: ['monaco-editor', '@monaco-editor/react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/editor/editor.api',
      'monaco-editor/esm/vs/editor/editor.main',
      'monaco-editor/esm/vs/basic-languages/monaco.contribution',
      'monaco-editor/esm/vs/language/typescript/monaco.contribution',
      'monaco-editor/esm/vs/language/css/monaco.contribution',
      'monaco-editor/esm/vs/language/html/monaco.contribution',
      'monaco-editor/esm/vs/language/json/monaco.contribution',
    ],
  },
  define: {
    // Monaco Editor requires this
    global: 'globalThis',
  },
  worker: {
    format: 'es',
  },
})