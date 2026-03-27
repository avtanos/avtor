import { useEffect, useRef, useState } from 'react'

export type DropdownAction = { label: string; onClick: () => void; tone?: 'danger' }

export function DropdownActions({ actions }: { actions: DropdownAction[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        ⋯
      </button>
      {open ? (
        <div
          className="ui-card"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            padding: 8,
            borderRadius: 16,
            minWidth: 220,
            zIndex: 1500,
          }}
          role="menu"
        >
          {actions.map((a, idx) => (
            <button
              key={idx}
              className="btn ghost"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid transparent',
                color: a.tone === 'danger' ? 'var(--danger)' : 'var(--text)',
              }}
              onClick={() => {
                setOpen(false)
                a.onClick()
              }}
              role="menuitem"
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

