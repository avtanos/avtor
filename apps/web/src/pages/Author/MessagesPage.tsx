import { useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { useInbox } from '../../app/inbox'
import { StatusPill } from '../../components/StatusPill'

export function MessagesPage() {
  const { t } = useI18n()
  const inbox = useInbox()
  const [selectedId, setSelectedId] = useState<string>(inbox.state.threads[0]?.id ?? '')
  const thread = useMemo(() => inbox.state.threads.find((x) => x.id === selectedId) ?? null, [inbox.state.threads, selectedId])
  const [text, setText] = useState('')
  return (
    <Layout
      title={t('nav.messages')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.messages') },
      ]}
    >
      <div className="two-col">
        <div className="ui-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
            <div style={{ fontWeight: 800 }}>{thread ? `Thread: ${thread.title}` : 'Thread'}</div>
            <button className="btn" onClick={() => inbox.markAllRead()}>Отметить прочитанным</button>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {thread?.messages?.length ? (
              thread.messages.map((m, idx) => (
                <div key={idx} style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 16, background: 'var(--panel-2)' }}>
                  <div style={{ fontWeight: 700 }}>
                    {m.by === 'editor' ? 'Редактор' : m.by === 'author' ? 'Автор' : 'Система'}{' '}
                    <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>• {new Date(m.at).toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--text-2)' }}>{m.text}</div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-2)' }}>Нет сообщений.</div>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Новое сообщение</div>
            <textarea className="ui-textarea" rows={4} placeholder="Введите сообщение" value={text} onChange={(e) => setText(e.target.value)} />
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn">Прикрепить файл</button>
              <button
                className="btn primary"
                disabled={!thread || !text.trim()}
                onClick={() => {
                  if (!thread) return
                  inbox.sendMessage(thread.id, text.trim())
                  setText('')
                }}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>

        <div className="ui-card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 800 }}>Список переписок</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {inbox.state.threads.map((th) => (
              <button
                key={th.id}
                className="btn"
                style={{
                  textAlign: 'left',
                  background: th.id === selectedId ? 'var(--primary-2)' : 'var(--panel)',
                  borderColor: th.id === selectedId ? '#cdd9ff' : 'var(--line)',
                }}
                onClick={() => {
                  setSelectedId(th.id)
                  inbox.selectThread(th.id)
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontWeight: 700 }}>{th.title}</span>
                  {th.unreadCount ? <StatusPill tone="yellow">{`${th.unreadCount} новых`}</StatusPill> : <StatusPill tone="gray">без новых</StatusPill>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

