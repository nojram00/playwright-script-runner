import { useState } from 'react'
import { CodeEditor } from './components/CodeEditor'
import { Button } from './components/Button'
import { OutputDisplay } from './components/OutputDisplay'
import './App.css'
import useApi from './hooks/useApi'
import Console from './components/Console'

const defaultScript = `
/**
 * NOTE: Recommended to use IFEE with return values to print results.
 * 
 * @param browser - The main browser context created by playwright browser.
 * @param close - callback for closing browser and its context.
 * 
 * This script allows users to use 'HELPER' constant for additional helper functions like parsing urls.
 **/
(async (browser, close) => {
  const page = await browser.newPage()
  
  await page.goto('https://example.com')
  
  const title = await page.title()
  console.log('Page title:', title)
  
  await close()
  return { title }
})(browser, close)`

function App() {
  const [code, setCode] = useState(defaultScript)

  const { sendScript, downloadResult, isLoading, result, error, clearDefault } = useApi()

  const handleExecute = async () => {
    await sendScript(code)
  }

  const handleCodeSave = () => {
    if (code.trim() === defaultScript.trim()) return;
    const a = document.createElement('a');
    const file = new Blob(
      [code], {
            type: "application/javascript"
        })
    const new_url = URL.createObjectURL(file)
    a.href = new_url
    a.download = `snippet-${new Date().toISOString().replace(/[:.]/g, "-")}.js`
    a.click()
    URL.revokeObjectURL(new_url)
  }

  const handleClear = () => {
    setCode(defaultScript)
    clearDefault()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Playwright Script Runner</h1>
          <p className="text-gray-400">
            Write and execute Playwright scripts directly in your browser
          </p>
        </header>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor Section */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Script Editor</h2>
              <CodeEditor
                value={code}
                onChange={setCode}
                language="javascript"
                height="500px"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleExecute}
                isLoading={isLoading}
                size="lg"
                className="flex-1"
              >
                Execute Script
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                disabled={isLoading}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={handleCodeSave}
                variant="outline"
                size="lg"
                disabled={isLoading}
                className="flex-1"
              >
                Download Code Snippet
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <OutputDisplay
            result={result}
            error={error}
            isLoading={isLoading}
            onDownload={downloadResult}
          />

          {/* Console */}
          <Console />
        </div>
      </div>
    </div>
  )
}

export default App
