import { useState } from 'react'
import { CodeEditor } from '../components/CodeEditor'

const defaultScript = `(async (browser, close) => {
  const page = await browser.newPage()
  
  await page.goto('https://example.com')
  
  const title = await page.title()
  console.log('Page title:', title)
  
  await close()
  return { title }
})(browser, close)`

export function CodeEditorExample() {
  const [code, setCode] = useState(defaultScript)

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Playwright Script Editor</h2>
        <p className="text-sm text-gray-600 mb-4">
          Write and edit your Playwright scripts with syntax highlighting and autocomplete
        </p>
      </div>
      
      <CodeEditor
        value={code}
        onChange={setCode}
        language="javascript"
        height="500px"
      />

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Current Code:</h3>
        <pre className="text-xs overflow-auto bg-white p-2 rounded border">
          {code}
        </pre>
      </div>
    </div>
  )
}

export default CodeEditorExample
