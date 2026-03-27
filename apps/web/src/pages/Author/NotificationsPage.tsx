import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { useInbox } from '../../app/inbox'
import { StatusPill } from '../../components/StatusPill'

export function NotificationsPage() {
  const { t } = useI18n()
  const inbox = useInbox()
  return (
    <Layout
      title={t('nav.notifications')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.notifications') },
      ]}
      actions={
        <>
          <button className="btn" onClick={() => inbox.markAllRead()}>Отметить всё прочитанным</button>
        </>
      }
    >
      <div className="three-col">
        {inbox.state.notifications.map((n) => (
          <div key={n.id} className="ui-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
              <div style={{ fontWeight: 800 }}>{n.title}</div>
              <StatusPill tone={n.unread ? 'blue' : 'gray'}>{n.unread ? 'Новое' : 'Прочитано'}</StatusPill>
            </div>
            <div style={{ marginTop: 10, color: 'var(--text-2)' }}>{n.text}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatusPill tone={n.tone}>{n.tone === 'yellow' ? 'Требует действия' : n.tone === 'green' ? 'Завершено' : 'Инфо'}</StatusPill>
              {n.unread ? (
                <button className="btn" onClick={() => inbox.markNotificationRead(n.id)}>Отметить прочитанным</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
