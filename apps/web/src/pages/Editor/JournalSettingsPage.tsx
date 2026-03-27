import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { api } from '../../lib/api'
import { useToasts } from '../../app/toasts'

export function JournalSettingsPage() {
  const { t, lang } = useI18n()
  const { push } = useToasts()
  const [busy, setBusy] = useState(false)
  const [journals, setJournals] = useState<Array<{ id: string; title: string }>>([])
  const [journalId, setJournalId] = useState('')
  const [form, setForm] = useState<any>({
    title: '',
    subdomain: '',
    defaultLang: 'ru',
    description: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    aimScope: '',
    guidelines: '',
    ethicalPolicy: '',
    publicationPolicy: '',
    pricingPolicy: '',
  })

  async function loadJournals() {
    try {
      const list = await api.listJournals()
      const slim = list.map((x) => ({ id: x.id, title: x.title }))
      setJournals(slim)
      if (!journalId && slim[0]?.id) setJournalId(slim[0].id)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_JOURNALS' })
    }
  }

  async function loadJournal(id: string) {
    if (!id) return
    setBusy(true)
    try {
      const j = await api.getJournal(id)
      setForm({
        title: j.title ?? '',
        subdomain: j.subdomain ?? '',
        defaultLang: j.defaultLang ?? 'ru',
        description: j.description ?? '',
        websiteUrl: j.websiteUrl ?? '',
        contactEmail: j.contactEmail ?? '',
        contactPhone: j.contactPhone ?? '',
        contactAddress: j.contactAddress ?? '',
        aimScope: j.aimScope ?? '',
        guidelines: j.guidelines ?? '',
        ethicalPolicy: j.ethicalPolicy ?? '',
        publicationPolicy: j.publicationPolicy ?? '',
        pricingPolicy: j.pricingPolicy ?? '',
      })
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD_JOURNAL' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void loadJournals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (journalId) void loadJournal(journalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId])

  const canSave = useMemo(() => form.title.trim().length > 0 && /^[a-z0-9-]{3,}$/.test(form.subdomain.trim()), [form.title, form.subdomain])

  async function onSave() {
    if (!journalId) return
    setBusy(true)
    try {
      await api.updateJournal(journalId, {
        title: form.title.trim(),
        subdomain: form.subdomain.trim(),
        defaultLang: form.defaultLang,
        description: form.description,
        websiteUrl: form.websiteUrl || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        contactAddress: form.contactAddress || undefined,
        aimScope: form.aimScope,
        guidelines: form.guidelines,
        ethicalPolicy: form.ethicalPolicy,
        publicationPolicy: form.publicationPolicy,
        pricingPolicy: form.pricingPolicy,
      })
      push({ type: 'success', title: t('common.save') })
      await loadJournal(journalId)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_SAVE' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout
      title="Настройки журнала"
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: 'Редакция', to: '/editor/dashboard' },
        { label: 'Настройки журнала' },
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
          <button className="btn-primary" disabled={!canSave || busy} onClick={() => void onSave()}>
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <div className="split-2" style={{ gap: 12 }}>
          <label style={labelStyle}>
            Название
            <input className="ui-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label style={labelStyle}>
            Subdomain
            <input className="ui-input" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} />
          </label>
          <label style={labelStyle}>
            Default language
            <select className="ui-select" value={form.defaultLang} onChange={(e) => setForm({ ...form, defaultLang: e.target.value })}>
              <option value="ru">ru</option>
              <option value="ky">ky</option>
              <option value="en">en</option>
            </select>
          </label>
          <label style={labelStyle}>
            Website
            <input className="ui-input" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://…" />
          </label>
          <label style={labelStyle}>
            Contact email
            <input className="ui-input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="editor@…" />
          </label>
          <label style={labelStyle}>
            Contact phone
            <input className="ui-input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+996…" />
          </label>
          <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
            Contact address
            <textarea className="ui-textarea" rows={3} value={form.contactAddress} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} />
          </label>
          <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
            Description ({lang})
            <textarea className="ui-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="ui-card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 900, color: 'var(--title)' }}>Политики (текст)</div>
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <label style={labelStyle}>
            {t('journalPublic.menu.aim')}
            <textarea className="ui-textarea" rows={5} value={form.aimScope} onChange={(e) => setForm({ ...form, aimScope: e.target.value })} />
          </label>
          <label style={labelStyle}>
            {t('journalPublic.menu.guidelines')}
            <textarea className="ui-textarea" rows={5} value={form.guidelines} onChange={(e) => setForm({ ...form, guidelines: e.target.value })} />
          </label>
          <label style={labelStyle}>
            {t('journalPublic.menu.ethical')}
            <textarea className="ui-textarea" rows={5} value={form.ethicalPolicy} onChange={(e) => setForm({ ...form, ethicalPolicy: e.target.value })} />
          </label>
          <label style={labelStyle}>
            Publication policy
            <textarea className="ui-textarea" rows={4} value={form.publicationPolicy} onChange={(e) => setForm({ ...form, publicationPolicy: e.target.value })} />
          </label>
          <label style={labelStyle}>
            Pricing policy
            <textarea className="ui-textarea" rows={4} value={form.pricingPolicy} onChange={(e) => setForm({ ...form, pricingPolicy: e.target.value })} />
          </label>
        </div>
      </div>
    </Layout>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }

