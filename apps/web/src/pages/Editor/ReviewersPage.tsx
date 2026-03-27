import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { api } from '../../lib/api'
import { Modal } from '../../components/Modal'
import { useToasts } from '../../app/toasts'

export function ReviewersPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const [subs, setSubs] = useState<any[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [reviewerEmail, setReviewerEmail] = useState('')
  const [submissionId, setSubmissionId] = useState('')

  useEffect(() => {
    api
      .listSubmissions()
      .then((x) => setSubs(x))
      .catch(() => setSubs([]))
  }, [])

  const firstSub = useMemo(() => subs[0]?.id ?? '', [subs])

  return (
    <Layout
      title={t('nav.reviewers')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.reviewers') },
      ]}
      actions={
        <>
          <button className="btn primary" onClick={() => setInviteOpen(true)}>
            Invite
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <table className="ui-table">
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Expertise</th>
              <th>Institution</th>
              <th>Invitations</th>
              <th>Completed</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cholpon Ibraeva</td>
              <td>Health Systems</td>
              <td>Medical Digital Center</td>
              <td>12</td>
              <td>9</td>
              <td>4.8</td>
              <td>Invite • View Profile</td>
            </tr>
            <tr>
              <td>Murat Asanov</td>
              <td>Construction Analytics</td>
              <td>OpenCM Lab</td>
              <td>8</td>
              <td>7</td>
              <td>4.7</td>
              <td>Invite • Extend</td>
            </tr>
            <tr>
              <td>Elena Petrova</td>
              <td>Open Metadata</td>
              <td>National University</td>
              <td>5</td>
              <td>5</td>
              <td>5.0</td>
              <td>Invite</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal
        open={inviteOpen}
        title="Invite reviewer (MVP)"
        onClose={() => setInviteOpen(false)}
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
                  const sid = submissionId || firstSub
                  if (!sid) {
                    push({ type: 'error', title: 'Ошибка', message: 'Нет статей для приглашения' })
                    return
                  }
                  await api.inviteReviewer({ submissionId: sid, reviewerEmail: reviewerEmail.trim() })
                  push({ type: 'success', title: 'Приглашение отправлено (MVP)' })
                  setInviteOpen(false)
                  setReviewerEmail('')
                  setSubmissionId('')
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
            Submission
            <select className="ui-select" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)}>
              <option value="">(по умолчанию)</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {String(s.title).slice(0, 60)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Reviewer email
            <input className="ui-input" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} placeholder="reviewer@example.com" />
          </label>
        </div>
      </Modal>
    </Layout>
  )
}

