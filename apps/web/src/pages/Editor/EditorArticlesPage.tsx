import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { api } from '../../lib/api'
import { StatusPill } from '../../components/StatusPill'
import { DropdownActions } from '../../components/DropdownActions'
import { Modal } from '../../components/Modal'
import { useToasts } from '../../app/toasts'
import { useAuth } from '../../app/auth'

export function EditorArticlesPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const { me } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSubmissionId, setInviteSubmissionId] = useState<string>('')
  const [reviewerEmail, setReviewerEmail] = useState('')

  async function load() {
    setBusy(true)
    try {
      const list = await api.listSubmissions()
      setRows(list)
    } catch (e: any) {
      push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_LOAD' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const viewRows = useMemo(() => rows, [rows])

  return (
    <Layout
      title={t('nav.editorArticles')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.editorArticles') },
      ]}
      actions={
        <>
          <button className="btn primary" onClick={() => setInviteOpen(true)}>
            Назначить рецензента
          </button>
          <button className="btn" onClick={() => void load()} disabled={busy}>
            {t('common.refresh')}
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Журнал</th>
              <th>Редактор</th>
              <th>Статус</th>
              <th>Обновлено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {viewRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ color: 'var(--text-2)' }}>
                  Нет статей. Создай подачу через “Новая подача”.
                </td>
              </tr>
            ) : (
              viewRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code>{String(r.id).slice(-8)}</code>
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.title}</td>
                  <td>{r.journal?.title ?? '—'}</td>
                  <td style={{ color: 'var(--text-2)' }}>
                    {r.handlingEditor?.fullName || r.handlingEditor?.email || (r.handlingEditorId ? String(r.handlingEditorId).slice(-8) : '—')}
                  </td>
                  <td>
                    <StatusPill tone={toneFor(String(r.status))}>{String(r.status)}</StatusPill>
                  </td>
                  <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}</td>
                  <td>
                    <DropdownActions
                      actions={[
                        { label: 'Открыть (MVP)', onClick: () => push({ type: 'info', title: 'MVP' }) },
                        {
                          label: 'Взять в работу (назначить меня)',
                          onClick: async () => {
                            try {
                              if (!me?.id) return
                              await api.assignEditor(r.id)
                              push({ type: 'success', title: 'Назначено' })
                              await load()
                            } catch (e: any) {
                              push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                            }
                          },
                        },
                        {
                          label: 'Назначить рецензента',
                          onClick: () => {
                            setInviteSubmissionId(r.id)
                            setInviteOpen(true)
                          },
                        },
                        {
                          label: 'Request Revision (MVP)',
                          onClick: async () => {
                            try {
                              await api.updateSubmissionStatus(r.id, 'REVISION_REQUESTED')
                              push({ type: 'success', title: 'Статус обновлён' })
                              await load()
                            } catch (e: any) {
                              push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                            }
                          },
                        },
                        {
                          label: 'Accept (MVP)',
                          onClick: async () => {
                            try {
                              await api.updateSubmissionStatus(r.id, 'ACCEPTED')
                              push({ type: 'success', title: 'Статус обновлён' })
                              await load()
                            } catch (e: any) {
                              push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                            }
                          },
                        },
                        {
                          label: 'Reject (MVP)',
                          tone: 'danger',
                          onClick: async () => {
                            try {
                              await api.updateSubmissionStatus(r.id, 'REJECTED')
                              push({ type: 'success', title: 'Статус обновлён' })
                              await load()
                            } catch (e: any) {
                              push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED' })
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={inviteOpen}
        title="Назначить рецензента"
        onClose={() => {
          setInviteOpen(false)
          setInviteSubmissionId('')
        }}
        footer={
          <>
            <button className="btn" onClick={() => setInviteOpen(false)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn primary"
              disabled={!reviewerEmail.trim()}
              onClick={async () => {
                try {
                  const submissionId = inviteSubmissionId || (viewRows[0]?.id ?? '')
                  if (!submissionId) return
                  await api.inviteReviewer({ submissionId, reviewerEmail: reviewerEmail.trim() })
                  push({ type: 'success', title: 'Приглашение отправлено (MVP)' })
                  setInviteOpen(false)
                  setReviewerEmail('')
                } catch (e: any) {
                  push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_INVITE' })
                }
              }}
            >
              Назначить
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            Email рецензента
            <input className="ui-input" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} placeholder="reviewer@example.com" />
          </label>
          <div style={{ color: 'var(--text-2)', fontSize: 13 }}>
            В MVP рецензент создаётся автоматически при приглашении.
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

function toneFor(status: string): 'gray' | 'blue' | 'yellow' | 'green' | 'red' {
  switch (status) {
    case 'NEW_SUBMISSION':
      return 'gray'
    case 'WITH_EDITOR':
    case 'UNDER_REVIEW':
      return 'blue'
    case 'REVISION_REQUESTED':
    case 'UNDER_REVISION':
      return 'yellow'
    case 'ACCEPTED':
    case 'PUBLISHED':
      return 'green'
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'red'
    default:
      return 'gray'
  }
}

