import { useEffect } from 'react'

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,24,40,0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 2000,
        padding: 16,
      }}
    >
      <div className="ui-card" style={{ width: 'min(720px, 100%)', padding: 18, borderRadius: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
          <button className="btn ghost" onClick={onClose}>
            ×
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
        {footer ? <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{footer}</div> : null}
      </div>
    </div>
  )
}

