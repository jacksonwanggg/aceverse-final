import { createContext } from 'react'

export type ToastType = 'error' | 'success' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export interface ToastContextValue {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
