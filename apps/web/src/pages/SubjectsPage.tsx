import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { mockData } from '../mock/mockData'

export function SubjectsPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.subjects')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.subjects') },
      ]}
    >
      <div className="split-3">
        {mockData.subjects.map((s) => (
          <SubjectCard key={s.id} title={s.title} desc={s.desc} />
        ))}
      </div>
    </Layout>
  )
}

function SubjectCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="ui-card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 950, color: '#fff' }}>{title}</div>
      <div style={{ marginTop: 10, color: 'var(--text-2)' }}>{desc}</div>
    </div>
  )
}

