import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { mockData } from '../mock/mockData'

export function PublishersPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.publishers')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.publishers') },
      ]}
    >
      <div className="split-3">
        {mockData.publishers.map((p) => (
          <PublisherCard key={p.id} title={p.title} desc={p.desc} />
        ))}
      </div>
    </Layout>
  )
}

function PublisherCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="ui-card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 950, color: '#fff' }}>{title}</div>
      <div style={{ marginTop: 10, color: 'var(--text-2)' }}>{desc}</div>
      <div style={{ marginTop: 12 }}>
        <button className="ui-button">Открыть профиль</button>
      </div>
    </div>
  )
}

