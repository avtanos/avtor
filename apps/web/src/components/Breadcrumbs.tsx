import { Link } from 'react-router-dom'

export type Crumb = { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', color: 'var(--text-2)' }}>
      {items.map((c, idx) => (
        <div key={`${c.label}-${idx}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {c.to ? (
            <Link to={c.to} style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
              {c.label}
            </Link>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.90)', fontWeight: 700 }}>{c.label}</span>
          )}
          {idx < items.length - 1 ? <span style={{ opacity: 0.45 }}>/</span> : null}
        </div>
      ))}
    </div>
  )
}

