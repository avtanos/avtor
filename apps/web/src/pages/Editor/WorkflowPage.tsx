import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { api } from '../../lib/api'
import { StatusPill } from '../../components/StatusPill'

export function WorkflowPage() {
  const { t } = useI18n()
  const [rows, setRows] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setBusy(true)
    api
      .listSubmissions()
      .then((x) => setRows(x))
      .catch(() => setRows([]))
      .finally(() => setBusy(false))
  }, [])

  const cols = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const r of rows) {
      const s = String(r.status)
      map.set(s, [...(map.get(s) ?? []), r])
    }
    const pick = (key: string) => map.get(key) ?? []
    return [
      { title: 'New Submission', key: 'NEW_SUBMISSION', items: pick('NEW_SUBMISSION') },
      { title: 'With Editor', key: 'WITH_EDITOR', items: pick('WITH_EDITOR') },
      { title: 'Under Review', key: 'UNDER_REVIEW', items: pick('UNDER_REVIEW') },
      { title: 'Revision', key: 'REVISION_REQUESTED', items: pick('REVISION_REQUESTED') },
      { title: 'Production', key: 'IN_PRODUCTION', items: pick('IN_PRODUCTION') },
    ]
  }, [rows])

  return (
    <Layout
      title={t('nav.workflow')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.workflow') },
      ]}
      actions={
        <>
          <button className="btn" onClick={() => window.location.reload()} disabled={busy}>
            {t('common.refresh')}
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <div className="split-5" style={{ gap: 14 }}>
          {cols.map((c) => (
            <div key={c.key} style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 18, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{c.title}</div>
                <span className="pill">{c.items.length}</span>
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {c.items.length ? (
                  c.items.slice(0, 10).map((r) => (
                    <div key={r.id} className="ui-card" style={{ padding: 12, borderRadius: 16, boxShadow: 'none' }}>
                      <div style={{ fontWeight: 800 }}>{String(r.title)}</div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <StatusPill tone="gray">{String(r.id).slice(-8)}</StatusPill>
                        <span className="pill">{r.journal?.title ?? '—'}</span>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <StatusPill tone={toneFor(String(r.status))}>{String(r.status)}</StatusPill>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-2)', fontSize: 13 }}>Пусто</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function toneFor(status: string): 'gray' | 'blue' | 'yellow' | 'green' | 'red' {
  switch (status) {
    case 'NEW_SUBMISSION':
      return 'gray'
    case 'WITH_EDITOR':
    case 'UNDER_REVIEW':
      return 'blue'
    case 'REVISION_REQUESTED':
    case 'UNDER_REVISION':
      return 'yellow'
    case 'ACCEPTED':
    case 'PUBLISHED':
      return 'green'
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'red'
    default:
      return 'gray'
  }
}

