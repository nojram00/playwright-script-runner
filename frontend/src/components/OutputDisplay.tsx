import { useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { cn } from '../lib/utils'

export interface OutputDisplayProps {
  result?: any
  error?: string | null
  isLoading: boolean
  onDownload?: () => void
  className?: string
}

export function OutputDisplay({
  result,
  error,
  isLoading,
  onDownload,
  className,
}: OutputDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExpandClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        <h2 className="text-xl font-semibold text-white mb-3">Output</h2>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                <p className="text-red-300 text-sm break-words">{error}</p>
              </div>
              <button
                onClick={handleExpandClick}
                className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/40 rounded transition-colors"
                title="View fullscreen"
                aria-label="Expand error"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6v4m12-4h-4v4M10 18h4v-4m-6-2h4v4"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-green-400 font-semibold">Success</h3>
              <button
                onClick={handleExpandClick}
                className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 text-green-400 hover:text-green-300 hover:bg-green-900/40 rounded transition-colors"
                title="View fullscreen"
                aria-label="Expand result"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6v4m12-4h-4v4M10 18h4v-4m-6-2h4v4"
                  />
                </svg>
              </button>
            </div>
            <pre className="text-green-300 text-xs overflow-auto bg-black/30 p-3 rounded max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
            {onDownload && (
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                Download Result
              </Button>
            )}
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

      {/* Fullscreen Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={error ? 'Error Details' : 'Result Details'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">Error</h3>
              <p className="text-red-300 text-sm break-words whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">Result</h3>
              <pre className="text-left text-green-300 text-sm overflow-auto bg-black/30 p-3 rounded max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
