import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { mockData } from '../mock/mockData'

export function SearchPage() {
  const { t } = useI18n()
  const loc = useLocation()
  const q = useMemo(() => new URLSearchParams(loc.search).get('q') ?? '', [loc.search])

  return (
    <Layout
      title={t('nav.search')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.search') },
      ]}
      actions={
        <>
          <button className="ui-button">{t('common.save')}</button>
          <button className="ui-button ghost">{t('common.reset')}</button>
        </>
      }
    >
      <div className="split-sidebar">
        <div className="ui-card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 950, color: '#fff' }}>{t('home.advancedSearch')}</div>
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            <label style={labelStyle}>
              {t('nav.search')}
              <input className="ui-input" defaultValue={q} placeholder={'"climate change" AND doi:*'} />
            </label>
            <label style={labelStyle}>
              {t('journals.title')}
              <input className="ui-input" placeholder="…" />
            </label>
            <label style={labelStyle}>
              Автор
              <input className="ui-input" placeholder="…" />
            </label>
            <label style={labelStyle}>
              DOI
              <input className="ui-input" placeholder="10.xxxx/…" />
            </label>
            <label style={labelStyle}>
              ISSN
              <input className="ui-input" placeholder="xxxx-xxxx" />
            </label>
            <button className="ui-button primary">{t('nav.search')}</button>
          </div>
        </div>

        <div className="ui-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontWeight: 950, color: '#fff' }}>{t('journals.results')}</div>
            <span className="ui-pill">{t('home.mvpHint')}</span>
          </div>
          <div style={{ marginTop: 12, color: 'var(--text-2)' }}>
            Демонстрационные результаты поиска:
          </div>
          <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, display: 'grid', gap: 10 }}>
            {mockData.searchResults.map((r) => (
              <div key={r.doi} className="ui-card" style={{ padding: 12, boxShadow: 'none' }}>
                <div style={{ fontWeight: 850, color: '#fff' }}>{r.title}</div>
                <div style={{ marginTop: 6, color: 'var(--text-2)' }}>
                  {r.journal} • {r.year}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="ui-pill">{r.doi}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="ui-pill">Статьи</span>
              <span className="ui-pill">{t('nav.journals')}</span>
              <span className="ui-pill">Исследователи</span>
              <span className="ui-pill">Издатели</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }

