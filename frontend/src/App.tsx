import { useState } from 'react'
import { CodeEditor } from './components/CodeEditor'
import { Button } from './components/Button'
import './App.css'
import useApi from './hooks/useApi'

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
              {result && (
              <Button
                onClick={downloadResult}
                variant="outline"
                size="lg"
                disabled={isLoading}
                className="flex-1"
              >
                Download Result
              </Button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-3">Output</h2>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                <p className="text-red-300 text-sm break-words">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-2">Success</h3>
                <pre className="text-green-300 text-xs overflow-auto bg-black/30 p-3 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 animate-pulse">
                <h3 className="text-blue-400 font-semibold">Executing...</h3>
                <p className="text-blue-300 text-sm">Please wait while the script runs</p>
              </div>
            )}

            {/* Info Box */}
            {!result && !error && !isLoading && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-gray-300 font-semibold mb-2">Info</h3>
                <p className="text-gray-400 text-sm">
                  Execute your Playwright script to see the results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
