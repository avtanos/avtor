import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { mockData } from '../../mock/mockData'

export function IndexesPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.indexes')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.indexes') },
      ]}
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Type</th>
              <th>URL</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockData.indexes.map((x) => (
              <tr key={`${x.index}-${x.url}`}>
                <td>{x.index}</td>
                <td>{x.type}</td>
                <td>{x.url}</td>
                <td>
                  <span className="ui-pill">{x.verification}</span>
                </td>
                <td>{x.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

