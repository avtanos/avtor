import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { mockData } from '../../mock/mockData'

export function EmailTemplatesPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.emailTemplates')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.emailTemplates') },
      ]}
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>Template Code</th>
              <th>Event</th>
              <th>Language</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockData.emailTemplates.map((tpl) => (
              <tr key={tpl.code}>
                <td>{tpl.code}</td>
                <td>{tpl.event}</td>
                <td>{tpl.language}</td>
                <td>
                  <span className="ui-pill">{tpl.status}</span>
                </td>
                <td>{tpl.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

