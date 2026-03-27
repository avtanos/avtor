import React, { createContext, useContext, useMemo, useState } from 'react'

type Toast = {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

type ToastCtx = {
  push: (t: Omit<Toast, 'id'>) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const api = useMemo<ToastCtx>(
    () => ({
      push: (t) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
        const toast: Toast = { id, ...t }
        setToasts((prev) => [toast, ...prev].slice(0, 5))
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== id))
        }, 3800)
      },
    }),
    [],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          right: 14,
          bottom: 14,
          display: 'grid',
          gap: 10,
          zIndex: 1000,
          width: 340,
          maxWidth: 'calc(100vw - 28px)',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="ui-card"
            style={{
              padding: 12,
              borderLeft: `4px solid ${tone(t.type)}`,
              boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>{t.title}</div>
              <button
                className="ui-button ghost"
                style={{ padding: '4px 8px', borderRadius: 10 }}
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              >
                ×
              </button>
            </div>
            {t.message ? <div style={{ marginTop: 6, color: 'rgba(233,236,245,0.72)' }}>{t.message}</div> : null}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToasts() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToasts must be used within ToastProvider')
  return ctx
}

function tone(type: Toast['type']) {
  switch (type) {
    case 'success':
      return 'var(--success)'
    case 'error':
      return 'var(--danger)'
    case 'warning':
      return '#fbbf24'
    default:
      return 'var(--primary-2)'
  }
}

