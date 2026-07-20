import { useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
// import type { Monaco } from '@monaco-editor/react'

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  theme?: 'light' | 'vs-dark'
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  theme = 'vs-dark',
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result
        if (typeof content === 'string') {
          resolve(content)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => {
        reject(new Error('Error reading file'))
      }
      reader.readAsText(file)
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    const file = files[0]

    // Check if file is a text-based file
    const textFileExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.txt', '.html', '.css', '.py', '.java', '.cpp', '.c', '.rb', '.go', '.rs', '.sh']
    const fileName = file.name.toLowerCase()
    const isTextFile = textFileExtensions.some(ext => fileName.endsWith(ext)) || file.type.startsWith('text/')

    if (!isTextFile) {
      alert(`File type not supported. Please drag and drop a text-based file. Supported: ${textFileExtensions.join(', ')}`)
      return
    }

    try {
      const fileContent = await readFileAsText(file)
      onChange(fileContent)
    } catch (error) {
      alert(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`w-full border rounded-lg overflow-hidden bg-gray-900 transition-colors ${
        isDragOver
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute min-h-screen inset-0 flex items-center justify-center bg-blue-900/30 backdrop-blur-sm z-10 rounded-lg pointer-events-none">
          <div className="text-center">
            <svg className="w-12 h-12 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-blue-300 font-semibold">Drop your file here</p>
            <p className="text-blue-200 text-sm">JavaScript, TypeScript, JSON, or other text files</p>
          </div>
        </div>
      )}
      <Editor
        onMount={handleEditorMount}
        height={height}
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme={theme}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'Monaco', 'Menlo', 'Consolas', 'monospace'",
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
