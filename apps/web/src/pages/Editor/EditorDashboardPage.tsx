import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { mockData } from '../../mock/mockData'

export function EditorDashboardPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.editorDashboard')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.editorDashboard') },
      ]}
    >
      <div className="split-4">
        {mockData.editorDashboard.map((s) => (
          <Stat key={s.title} title={s.title} value={s.value} note={s.note} />
        ))}
      </div>
    </Layout>
  )
}

function Stat({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="ui-card" style={{ padding: 14 }}>
      <div style={{ color: 'var(--text-2)', fontWeight: 850, fontSize: 13 }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 950, color: '#fff' }}>{value}</div>
      <div style={{ marginTop: 8, color: 'var(--text-2)' }}>{note}</div>
    </div>
  )
}

