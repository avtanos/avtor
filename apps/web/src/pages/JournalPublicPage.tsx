import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { api } from '../lib/api'

export function JournalPublicPage() {
  const { t, lang } = useI18n()
  const { subdomain } = useParams()
  const sd = useMemo(() => subdomain ?? 'unknown', [subdomain])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string>('')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!sd) return
    setBusy(true)
    setErr('')
    api
      .getPublicJournal(sd, lang)
      .then(setData)
      .catch((e: any) => setErr(e?.error ?? 'FAILED_TO_LOAD'))
      .finally(() => setBusy(false))
  }, [sd, lang])

  const journal = data?.journal
  const pages = (data?.pages ?? []) as Array<{ slug: string; title: string; content: string; language: string }>
  const issues = (data?.issues ?? []) as Array<any>

  const pageBySlug = useMemo(() => {
    const map = new Map<string, any>()
    for (const p of pages) map.set(String(p.slug), p)
    return map
  }, [pages])

  const stats = useMemo(() => {
    const a = issues.length ? String(issues.length * 10) : '—'
    return [
      { label: t('journalPublic.stats.articles'), value: a },
      { label: t('journalPublic.stats.views'), value: '—' },
      { label: t('journalPublic.stats.downloads'), value: '—' },
      { label: t('journalPublic.stats.favorites'), value: '—' },
    ]
  }, [issues.length, t])

  const about = pageBySlug.get('about')?.content ?? journal?.description ?? '—'
  const aim = pageBySlug.get('aim-scope')?.content ?? journal?.aimScope ?? '—'
  const guidelines = pageBySlug.get('author-guidelines')?.content ?? journal?.guidelines ?? '—'
  const ethical = pageBySlug.get('ethical-policy')?.content ?? journal?.ethicalPolicy ?? '—'

  return (
    <Layout
      title={`${t('journalPublic.titlePrefix')}: ${journal?.title ?? sd}`}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.journals'), to: '/journals' },
        { label: sd },
      ]}
      actions={
        <>
          <button className="ui-button primary">{t('journalPublic.action.submit')}</button>
          <button className="ui-button">{t('journalPublic.action.follow')}</button>
          <button className="ui-button ghost">{t('journalPublic.action.share')}</button>
        </>
      }
    >
      <div className="split-sidebar">
        <div className="ui-card" style={{ padding: 14 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="ui-pill">{t('journalPublic.badge.openAccess')}</span>
              <span className="ui-pill">{t('journalPublic.badge.active')}</span>
              <span className="ui-pill">{t('journalPublic.badge.indexed')}</span>
            </div>
            <div style={{ color: 'var(--text-2)' }}>
              {journal ? t('journalPublic.description') : busy ? t('common.loading') : err ? err : '—'}
            </div>

            <div className="split-4" style={{ gap: 10 }}>
              {stats.map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} />
              ))}
            </div>

            <Section id="about" title={t('journalPublic.menu.about')} content={about} />
            <Section id="aim" title={t('journalPublic.menu.aim')} content={aim} />
            <Section id="guidelines" title={t('journalPublic.menu.guidelines')} content={guidelines} />
            <Section id="ethical" title={t('journalPublic.menu.ethical')} content={ethical} />
            <Section
              id="archive"
              title={t('journalPublic.menu.archive')}
              content={
                issues.length
                  ? issues
                      .map((x: any) => {
                        const vol = x.volume ? `, Vol. ${x.volume}` : ''
                        const no = x.number ? `, No. ${x.number}` : ''
                        const dt = x.publicationDate ? ` • ${new Date(x.publicationDate).toLocaleDateString()}` : ''
                        return `- ${x.year}${vol}${no}${x.title ? ` • ${x.title}` : ''}${dt}`
                      })
                      .join('\n')
                  : '—'
              }
            />

            <Section
              id="contact"
              title={t('journalPublic.menu.contact')}
              content={[
                journal?.websiteUrl ? `Website: ${journal.websiteUrl}` : null,
                journal?.contactEmail ? `Email: ${journal.contactEmail}` : null,
                journal?.contactPhone ? `Phone: ${journal.contactPhone}` : null,
                journal?.contactAddress ? `Address: ${journal.contactAddress}` : null,
              ]
                .filter(Boolean)
                .join('\n') || '—'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, alignSelf: 'start', position: 'sticky', top: 84 }}>
          <div className="ui-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 950, color: 'var(--title)' }}>{t('journalPublic.menu')}</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <a href="#about" style={menuLinkStyle}>
                {t('journalPublic.menu.about')}
              </a>
              <a href="#aim" style={menuLinkStyle}>
                {t('journalPublic.menu.aim')}
              </a>
              <a href="#guidelines" style={menuLinkStyle}>
                {t('journalPublic.menu.guidelines')}
              </a>
              <a href="#ethical" style={menuLinkStyle}>
                {t('journalPublic.menu.ethical')}
              </a>
              <a href="#contact" style={menuLinkStyle}>
                {t('journalPublic.menu.contact')}
              </a>
              <a href="#archive" style={menuLinkStyle}>
                {t('journalPublic.menu.archive')}
              </a>
            </div>
          </div>

          <div className="ui-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 950, color: 'var(--title)' }}>{t('journalPublic.quickActions')}</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              <button className="ui-button primary">{t('journalPublic.submitArticle')}</button>
              <Link to="/journals" className="ui-button ghost" style={{ textDecoration: 'none', textAlign: 'center' }}>
                {t('journalPublic.backToCatalog')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12 }}>
      <div style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 20, fontWeight: 950, color: 'var(--title)' }}>{value}</div>
    </div>
  )
}

function Section({ id, title, content }: { id: string; title: string; content: string }) {
  return (
    <div id={id} style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 6 }}>
      <div style={{ fontWeight: 950, color: 'var(--title)' }}>{title}</div>
      <div style={{ marginTop: 10, color: 'var(--text-2)', whiteSpace: 'pre-line' }}>{content}</div>
    </div>
  )
}

const menuLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid var(--line)',
  background: 'var(--panel-2)',
  color: 'var(--text)',
  fontWeight: 750,
}

