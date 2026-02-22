import { useCallback, useState } from 'react'
import { ToastContext, type ToastItem, type ToastType } from '../contexts/toastContext'

let nextId = 0
const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismiss }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastList({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`pointer-events-auto rounded-lg pl-4 pr-4 py-3 shadow-lg border-l-4 ${
            t.type === 'error'
              ? 'bg-red-950/95 border border-red-700 border-l-red-500 text-red-100'
              : t.type === 'success'
                ? 'bg-[#0D0D0D] border border-[#EF8C60] border-l-[#EF8C60] text-gray-100 shadow-[0_0_20px_rgba(239,140,96,0.15)]'
                : t.type === 'info'
                  ? 'bg-[#1A1A1A] border border-gray-600 border-l-[#EF8C60] text-gray-100'
                  : 'bg-[#1A1A1A] border border-gray-600 border-l-[#EF8C60]/60 text-gray-100'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#EF8C60] rounded"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
