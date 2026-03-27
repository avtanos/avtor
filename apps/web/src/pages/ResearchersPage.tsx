import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { mockData } from '../mock/mockData'

export function ResearchersPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.researchers')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.researchers') },
      ]}
    >
      <div className="split-3">
        {mockData.researchers.map((r) => (
          <ResearcherCard key={r.id} name={r.name} desc={r.desc} pill={r.pill} action={r.action} />
        ))}
      </div>
    </Layout>
  )
}

function ResearcherCard({
  name,
  desc,
  pill,
  action,
}: {
  name: string
  desc: string
  pill: string
  action: string
}) {
  return (
    <div className="ui-card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 950, color: '#fff' }}>{name}</div>
      <div style={{ marginTop: 10, color: 'var(--text-2)', whiteSpace: 'pre-line' }}>{desc}</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="ui-pill">{pill}</span>
        <button className="ui-button">{action}</button>
      </div>
    </div>
  )
}

