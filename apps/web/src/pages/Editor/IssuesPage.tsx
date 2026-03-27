import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { Modal } from '../../components/Modal'
import { DropdownActions } from '../../components/DropdownActions'
import { StatusPill } from '../../components/StatusPill'
import { api } from '../../lib/api'
import { useToasts } from '../../app/toasts'

export function IssuesPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [journals, setJournals] = useState<Array<{ id: string; title: string }>>([])
  const [journalId, setJournalId] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ year: new Date().getFullYear(), volume: 1, number: 1, title: '', publicationDate: '' })

  async function loadJournals() {
    try {
      const list = await api.listJournals()
      setJournals(list.map((x) => ({ id: x.id, title: x.title })))
      if (!journalId && list[0]?.id) setJournalId(list[0].id)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_JOURNALS' })
    }
  }

  async function loadIssues(jId: string) {
    if (!jId) return
    setBusy(true)
    try {
      const list = await api.listIssues(jId)
      setItems(list)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_ISSUES' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void loadJournals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (journalId) void loadIssues(journalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId])

  const rows = useMemo(() => items, [items])
  return (
    <Layout
      title={t('nav.issues')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.issues') },
      ]}
      actions={
        <>
          <select className="ui-select" value={journalId} onChange={(e) => setJournalId(e.target.value)} style={{ maxWidth: 420 }}>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <button className="btn primary" onClick={() => setOpen(true)}>
            Создать выпуск
          </button>
          <button className="btn" onClick={() => void loadIssues(journalId)} disabled={busy || !journalId}>
            {t('common.refresh')}
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Volume</th>
              <th>Issue</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.year}</td>
                <td>{r.volume}</td>
                <td>{r.number}</td>
                <td>{r.publicationDate ? new Date(r.publicationDate).toISOString().slice(0, 10) : '—'}</td>
                <td>
                  <StatusPill tone={String(r.status) === 'Published' ? 'green' : String(r.status) === 'Draft' ? 'gray' : 'yellow'}>
                    {String(r.status)}
                  </StatusPill>
                </td>
                <td>
                  <DropdownActions
                    actions={[
                      { label: 'Открыть (MVP)', onClick: () => {} },
                      {
                        label: String(r.status) === 'Published' ? 'Снять с публикации' : 'Опубликовать',
                        onClick: async () => {
                          try {
                            await api.updateIssue(journalId, r.id, { status: String(r.status) === 'Published' ? 'Draft' : 'Published' })
                            push({ type: 'success', title: 'Готово' })
                            await loadIssues(journalId)
                          } catch (e: any) {
                            push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                          }
                        },
                      },
                      { label: 'Экспорт XML (MVP)', onClick: () => {} },
                      {
                        label: 'Удалить',
                        tone: 'danger',
                        onClick: async () => {
                          try {
                            await api.deleteIssue(journalId, r.id)
                            push({ type: 'success', title: 'Удалено' })
                            await loadIssues(journalId)
                          } catch (e: any) {
                            push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                          }
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title="Создать выпуск (MVP)"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn primary"
              disabled={!journalId}
              onClick={async () => {
                try {
                  await api.createIssue(journalId, {
                    year: Number(form.year),
                    volume: Number(form.volume),
                    number: Number(form.number),
                    title: form.title.trim() || undefined,
                    publicationDate: form.publicationDate ? new Date(form.publicationDate).toISOString() : undefined,
                    status: 'Draft',
                  })
                  push({ type: 'success', title: 'Выпуск создан' })
                  setOpen(false)
                  setForm({ year: new Date().getFullYear(), volume: 1, number: 1, title: '', publicationDate: '' })
                  await loadIssues(journalId)
                } catch (e: any) {
                  push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_CREATE_ISSUE' })
                }
              }}
            >
              {t('common.create')}
            </button>
          </>
        }
      >
        <div className="split-2">
          <label style={{ display: 'grid', gap: 6 }}>
            Year
            <input className="ui-input" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Volume
            <input className="ui-input" value={form.volume} onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Issue
            <input className="ui-input" value={form.number} onChange={(e) => setForm({ ...form, number: Number(e.target.value) })} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Title
            <input className="ui-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Publication date
            <input className="ui-input" value={form.publicationDate} onChange={(e) => setForm({ ...form, publicationDate: e.target.value })} placeholder="2026-06-01" />
          </label>
        </div>
      </Modal>
    </Layout>
  )
}

