import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className={cn('bg-gray-900 rounded-lg shadow-2xl flex flex-col max-w-4xl w-11/12 max-h-[90vh]', className)}>
        {/* Modal Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Close modal"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
