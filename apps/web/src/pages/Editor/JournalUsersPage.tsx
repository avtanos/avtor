import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { mockData } from '../../mock/mockData'

export function JournalUsersPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.journalUsers')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.journalUsers') },
      ]}
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockData.journalUsers.map((u) => (
              <tr key={`${u.email}-${u.role}`}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className="ui-pill">{u.status}</span>
                </td>
                <td>{u.joined}</td>
                <td>{u.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

