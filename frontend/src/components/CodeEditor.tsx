import { useRef } from 'react'
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

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor
  }

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden bg-gray-900">
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
