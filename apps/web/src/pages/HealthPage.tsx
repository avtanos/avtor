import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'

export function HealthPage() {
  const [state, setState] = useState<{ ok: boolean; error?: string }>({ ok: false })

  useEffect(() => {
    let alive = true
    api
      .health()
      .then(() => {
        if (!alive) return
        setState({ ok: true })
      })
      .catch((e: any) => {
        if (!alive) return
        setState({ ok: false, error: e?.error ?? 'API_UNAVAILABLE' })
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <Layout
      title="Health"
      crumbs={[
        { label: 'Home', to: '/' },
        { label: 'Health' },
      ]}
    >
      <div className="ui-card" style={{ padding: 14, maxWidth: 820 }}>
        <div style={{ fontWeight: 950, color: '#fff' }}>API Health</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: state.ok ? 'var(--success)' : 'var(--danger)',
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.90)' }}>{state.ok ? 'OK' : 'ERROR'}</span>
          {!state.ok && state.error ? <span style={{ color: 'var(--text-2)' }}>{state.error}</span> : null}
        </div>
        <div style={{ marginTop: 10, color: 'var(--text-2)' }}>
          Base URL: <code>{import.meta.env.VITE_API_BASE_URL}</code>
        </div>
      </div>
    </Layout>
  )
}

