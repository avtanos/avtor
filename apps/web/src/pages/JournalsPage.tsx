import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useI18n } from '../app/i18n'
import { useToasts } from '../app/toasts'
import { Link } from 'react-router-dom'

type Journal = { id: string; title: string; subdomain: string; defaultLang: string }
type ViewMode = 'cards' | 'table'

export function JournalsPage() {
  const { t } = useI18n()
  const { push } = useToasts()

  const [journals, setJournals] = useState<Journal[]>([])
  const [busy, setBusy] = useState(false)

  const [view, setView] = useState<ViewMode>('cards')

  async function refresh() {
    setBusy(true)
    try {
      const list = await api.listJournals()
      setJournals(list)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filtered = useMemo(() => {
    return journals
  }, [journals])

  return (
    <Layout
      title={t('journals.title')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('journals.title') },
      ]}
      actions={
        <>
          <button className="btn" onClick={() => void refresh()} disabled={busy}>
            {t('common.refresh')}
          </button>
          <button
            className={`btn ${view === 'cards' ? 'soft' : ''}`}
            onClick={() => setView('cards')}
          >
            {t('journals.view.cards')}
          </button>
          <button
            className={`btn ${view === 'table' ? 'soft' : ''}`}
            onClick={() => setView('table')}
          >
            {t('journals.view.table')}
          </button>
        </>
      }
    >
      <div className="section">
        <div className="section-head">
          <div>
            <h3>{t('journals.title')}</h3>
            <p>Каталог журналов с карточками, статусами, метриками и действиями.</p>
          </div>
          <button className="btn">Все журналы</button>
        </div>

        {view === 'cards' ? (
          <div className="journals-grid">
            {filtered.map((j) => (
              <JournalCard key={j.id} j={j} />
            ))}
          </div>
        ) : (
          <div className="ui-card" style={{ padding: 18 }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('journals.title')}</th>
                  <th>{t('journals.publisher')}</th>
                  <th>{t('journals.issn')}</th>
                  <th>{t('journals.language')}</th>
                  <th>{t('journals.badges')}</th>
                  <th>{t('journals.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <strong>{j.title}</strong>
                      <div style={{ marginTop: 4 }}>
                        <span className="pill">{j.subdomain}</span>
                      </div>
                    </td>
                    <td>—</td>
                    <td>—</td>
                    <td>{j.defaultLang}</td>
                    <td>
                      <span className="pill">Open Access</span>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <Link className="btn primary" to={`/j/${j.subdomain}`}>
                          {t('journals.open')}
                        </Link>
                        <button className="btn" onClick={() => push({ type: 'info', title: t('journals.copied') })}>
                          {t('journals.copyLink')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

function JournalCard({ j }: { j: Journal }) {
  const { t } = useI18n()
  return (
    <article className="journal-card">
      <div className="cover">
        <span className="cover-badge">{t('journals.openAccess')}</span>
      </div>
      <div className="journal-body">
        <h4 className="journal-title">{j.title}</h4>
        <div className="meta">
          <span>e-ISSN: —</span>
          <span>{j.defaultLang}</span>
        </div>
        <p className="journal-desc">
          {(j as any).description ?? 'Краткое описание журнала пока не заполнено.'}
        </p>
        <div className="tags">
          <span className="tag">AI</span>
          <span className="tag">GovTech</span>
          <span className="tag">{j.subdomain}</span>
        </div>
        <div className="inline-actions" style={{ marginTop: 14 }}>
          <Link className="btn primary" to={`/j/${j.subdomain}`}>
            {t('journals.open')}
          </Link>
          <button className="btn">{t('journals.card.follow')}</button>
        </div>
      </div>
    </article>
  )
}

