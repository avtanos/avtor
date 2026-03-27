import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { Modal } from '../../components/Modal'
import { DropdownActions } from '../../components/DropdownActions'
import { api } from '../../lib/api'
import { useToasts } from '../../app/toasts'

export function JournalPagesPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [journals, setJournals] = useState<Array<{ id: string; title: string }>>([])
  const [journalId, setJournalId] = useState('')
  const [pages, setPages] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string>('')
  const [form, setForm] = useState({
    title: '',
    slug: '',
    language: 'ru',
    published: false,
    showInRightMenu: false,
    showInTopNav: false,
    sortOrder: 0,
    content: '',
  })

  async function loadJournals() {
    try {
      const list = await api.listJournals()
      setJournals(list.map((x) => ({ id: x.id, title: x.title })))
      if (!journalId && list[0]?.id) setJournalId(list[0].id)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_JOURNALS' })
    }
  }

  async function loadPages(jId: string) {
    if (!jId) return
    setBusy(true)
    try {
      const list = await api.listJournalPages(jId)
      setPages(list)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_PAGES' })
    } finally {
      setBusy(false)
    }
  }

  async function openCreate() {
    setEditingId('')
    setForm({
      title: '',
      slug: '',
      language: 'ru',
      published: false,
      showInRightMenu: false,
      showInTopNav: false,
      sortOrder: 0,
      content: '',
    })
    setOpen(true)
  }

  async function openEdit(id: string) {
    if (!journalId) return
    try {
      setBusy(true)
      const page = await api.getJournalPage(journalId, id)
      setEditingId(id)
      setForm({
        title: page.title ?? '',
        slug: page.slug ?? '',
        language: page.language ?? 'ru',
        published: !!page.published,
        showInRightMenu: !!page.showInRightMenu,
        showInTopNav: !!page.showInTopNav,
        sortOrder: Number(page.sortOrder ?? 0),
        content: page.content ?? '',
      })
      setOpen(true)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_PAGE' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void loadJournals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (journalId) void loadPages(journalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId])

  const rows = useMemo(() => pages, [pages])
  return (
    <Layout
      title={t('nav.journalPages')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.journalPages') },
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
          <button className="btn primary" onClick={() => void openCreate()}>
            Добавить страницу
          </button>
          <button className="btn" onClick={() => void loadPages(journalId)} disabled={busy || !journalId}>
            {t('common.refresh')}
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>Page title</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Published</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 700 }}>{p.title}</td>
                <td>{p.slug}</td>
                <td>{p.type}</td>
                <td>{p.published ? 'Yes' : 'No'}</td>
                <td>{p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : '—'}</td>
                <td>
                  <DropdownActions
                    actions={[
                      { label: 'Edit', onClick: () => void openEdit(p.id) },
                      {
                        label: p.published ? 'Unpublish' : 'Publish',
                        onClick: async () => {
                          try {
                            await api.updateJournalPage(journalId, p.id, { published: !p.published })
                            push({ type: 'success', title: 'Готово' })
                            await loadPages(journalId)
                          } catch (e: any) {
                            push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                          }
                        },
                      },
                      {
                        label: 'Delete',
                        tone: 'danger',
                        onClick: async () => {
                          try {
                            await api.deleteJournalPage(journalId, p.id)
                            push({ type: 'success', title: 'Удалено' })
                            await loadPages(journalId)
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
        title="Страница журнала (MVP)"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn primary"
              disabled={!journalId || !form.title.trim() || !form.slug.trim()}
              onClick={async () => {
                try {
                  if (editingId) {
                    await api.updateJournalPage(journalId, editingId, {
                      title: form.title.trim(),
                      slug: form.slug.trim(),
                      language: form.language,
                      published: form.published,
                      showInRightMenu: form.showInRightMenu,
                      showInTopNav: form.showInTopNav,
                      sortOrder: Number(form.sortOrder) || 0,
                      content: form.content,
                    })
                    push({ type: 'success', title: 'Сохранено' })
                  } else {
                    await api.createJournalPage(journalId, {
                      title: form.title.trim(),
                      slug: form.slug.trim(),
                      language: form.language,
                      published: form.published,
                      showInRightMenu: form.showInRightMenu,
                      showInTopNav: form.showInTopNav,
                      sortOrder: Number(form.sortOrder) || 0,
                      content: form.content,
                      type: 'custom',
                    })
                    push({ type: 'success', title: 'Создано' })
                  }
                  setOpen(false)
                  setEditingId('')
                  await loadPages(journalId)
                } catch (e: any) {
                  push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_SAVE' })
                }
              }}
            >
              {t('common.save')}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            Title
            <input className="ui-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Slug
            <input className="ui-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <div className="split-3" style={{ gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              Language
              <select className="ui-select" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="ru">ru</option>
                <option value="ky">ky</option>
                <option value="en">en</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              Sort
              <input className="ui-input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)', marginTop: 22 }}>
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published
            </label>
          </div>
          <div className="split-2" style={{ gap: 10 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)' }}>
              <input type="checkbox" checked={form.showInTopNav} onChange={(e) => setForm({ ...form, showInTopNav: e.target.checked })} />
              Show in top nav
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)' }}>
              <input type="checkbox" checked={form.showInRightMenu} onChange={(e) => setForm({ ...form, showInRightMenu: e.target.checked })} />
              Show in right menu
            </label>
          </div>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)' }}>
            <span style={{ fontSize: 13 }}>
              Slug должен быть в формате <code>a-z0-9-</code>.
            </span>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Content
            <textarea className="ui-textarea" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </label>
        </div>
      </Modal>
    </Layout>
  )
}
