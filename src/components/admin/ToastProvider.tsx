import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastTone } from './ToastContext'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = ++nextId.current
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => removeToast(id), 3_500)
  }, [removeToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-region" aria-live="polite" aria-label="알림">
        {toasts.map((toast) => (
          <div className={`admin-toast ${toast.tone}`} role="status" key={toast.id}>
            <span className="admin-toast-icon">{toast.tone === 'success' ? '✓' : toast.tone === 'error' ? '!' : 'i'}</span>
            <p>{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} aria-label="알림 닫기">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
