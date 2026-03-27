import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { mockData } from '../mock/mockData'

export function AdminPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.admin')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.admin') },
      ]}
    >
      <div className="split-3">
        {mockData.adminCards.map((x) => (
          <Card key={x.title} title={x.title} desc={x.desc} action={x.action} />
        ))}
      </div>
    </Layout>
  )
}

function Card({ title, desc, action }: { title: string; desc: string; action: string }) {
  return (
    <div className="ui-card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 950, color: '#fff' }}>{title}</div>
      <div style={{ marginTop: 10, color: 'var(--text-2)' }}>{desc}</div>
      <div style={{ marginTop: 12 }}>
        <button className="ui-button">{action}</button>
      </div>
    </div>
  )
}

