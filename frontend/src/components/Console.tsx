import { useState, useCallback, useRef, useEffect } from 'react'
import useEventSource from '../hooks/useEventSource'
import { Modal } from './Modal'
import { cn } from '../lib/utils'

export interface LogEntry {
  id: string
  type: 'log' | 'error' | 'warn' | 'info' | 'debug'
  timestamp: Date
  message: string
}

export default function Console() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all')
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Handle incoming messages from EventSource
  const handleMessage = useCallback((message: string) => {
    try {
      // Try to parse JSON message
      let parsedMessage = message
      let messageType: LogEntry['type'] = 'log'

      try {
        const parsed = JSON.parse(message)
        if (parsed.error) {
          messageType = 'error'
          parsedMessage = parsed.error
        } else if (parsed.warning) {
          messageType = 'warn'
          parsedMessage = parsed.warning
        } else if (parsed.info) {
          messageType = 'info'
          parsedMessage = parsed.info
        } else if (parsed.message) {
          parsedMessage = parsed.message
        }
      } catch {
        // If not JSON, treat as plain text log
        parsedMessage = message
      }

      const newLog: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        type: messageType,
        timestamp: new Date(),
        message: parsedMessage,
      }

      setLogs((prevLogs) => [...prevLogs, newLog])
    } catch (error) {
      console.error('Error processing message:', error)
    }
  }, [])

  // Initialize EventSource
  useEventSource({ onmessage: handleMessage })

  // Save console logs to file
  const handleLogSave = () => {
    try {
      // Validate logs exist
      if (!logs || logs.length === 0) {
        alert('No logs to save');
        return;
      }

      // Format logs for export
      const formattedLogs = logs
        .map((log) => {
          const timestamp = log.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          return `[${timestamp}] [${log.type.toUpperCase()}] ${log.message}`;
        })
        .join('\n');

      // Create and download file
      const blob = new Blob([formattedLogs], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `console-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving logs:', error);
      alert('Failed to save logs');
    }
  }

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // Filter logs based on current filter
  const filteredLogs = logs.filter((log) =>
    filter === 'all' ? true : log.type === filter
  )

  // Get icon for log type
  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warn':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      case 'debug':
        return (
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM5 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 4.343a1 1 0 011.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 000 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  // Get color class for log type
  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-300'
      case 'warn':
        return 'text-yellow-300'
      case 'info':
        return 'text-blue-300'
      case 'debug':
        return 'text-purple-300'
      default:
        return 'text-gray-300'
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  // Render console logs
  const renderConsoleLogs = (heightClass: string = 'h-60') => (
    <div
      ref={scrollContainerRef}
      className={cn(
        'bg-black/50 border border-gray-700 rounded-lg p-3 font-mono text-xs overflow-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700',
        heightClass
      )}
    >
      {filteredLogs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No logs to display</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex gap-2 py-1 hover:bg-gray-900/50 transition-colors rounded px-1"
            >
              {/* Time */}
              <span className="text-gray-600 flex-shrink-0 w-20">
                {formatTime(log.timestamp)}
              </span>

              {/* Type Icon */}
              <span className="flex-shrink-0 w-4 flex items-center">
                {getTypeIcon(log.type)}
              </span>

              {/* Message */}
              <span className={cn('flex-1 break-words text-left', getTypeColor(log.type))}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-4">
        {/* Console Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Console</h2>
          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreenOpen(true)}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Fullscreen"
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

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Console Container */}
        {isExpanded && (
          <div className="space-y-3">
            {/* Filter and Controls */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'log', 'error', 'warn', 'info'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={cn(
                    'px-3 py-1 rounded text-sm font-medium transition-colors',
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  )}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
              <div className="flex-1" />
              <label className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                Auto-scroll
              </label>
              <button
                onClick={handleClearLogs}
                className="px-3 py-1 rounded text-sm font-medium bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors"
                title="Clear logs"
              >
                Clear
              </button>
              <button
                onClick={handleLogSave}
                className="px-3 py-1 rounded text-sm font-medium bg-gray-800 text-gray-300 hover:bg-green-900/50 hover:text-green-300 transition-colors"
                title="Save logs to file"
              >
                Save
              </button>
            </div>

            {/* Console Output */}
            {renderConsoleLogs('h-60')}

            {/* Console Stats */}
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Total: {logs.length}</span>
              <span>Errors: {logs.filter((l) => l.type === 'error').length}</span>
              <span>Warnings: {logs.filter((l) => l.type === 'warn').length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Modal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        title="Console - Fullscreen View"
      >
        <div className="space-y-4">
          {/* Filter and Controls in Modal */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'log', 'error', 'warn', 'info'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors"
              title="Clear logs"
            >
              Clear
            </button>
            <button
              onClick={handleLogSave}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-800 text-gray-300 hover:bg-green-900/50 hover:text-green-300 transition-colors"
              title="Save logs to file"
            >
              Save
            </button>
          </div>

          {/* Console Output in Fullscreen */}
          {renderConsoleLogs('h-96')}

          {/* Modal Stats */}
          <div className="flex gap-4 text-xs text-gray-400">
            <span>Total: {logs.length}</span>
            <span>Errors: {logs.filter((l) => l.type === 'error').length}</span>
            <span>Warnings: {logs.filter((l) => l.type === 'warn').length}</span>
          </div>
        </div>
      </Modal>
    </>
  )
}