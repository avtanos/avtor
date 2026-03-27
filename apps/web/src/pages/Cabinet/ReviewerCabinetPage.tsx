import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useI18n } from '../../app/i18n'
import { useToasts } from '../../app/toasts'
import { mockData } from '../../mock/mockData'

type Row = Awaited<ReturnType<typeof api.myReviews>>[number]

export function ReviewerCabinetPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)

  async function load() {
    setBusy(true)
    try {
      const list = await api.myReviews()
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

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="ui-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <div style={{ fontWeight: 950, color: '#fff' }}>{t('cabinet.reviewer')}</div>
          <button className="ui-button" onClick={() => void load()} disabled={busy}>
            {t('common.refresh')}
          </button>
        </div>
        <div style={{ marginTop: 10, color: 'var(--text-2)' }}>
          Приглашения, активные рецензии, формы рецензирования, файлы и дедлайны.
        </div>
      </div>

      <div className="ui-card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 900, color: '#fff' }}>Рекомендации рецензента</div>
        <div style={{ marginTop: 10, color: 'var(--text-2)', display: 'grid', gap: 6 }}>
          {mockData.reviewerTips.map((x) => (
            <div key={x}>- {x}</div>
          ))}
        </div>
      </div>

      <div className="ui-card" style={{ padding: 14 }}>
        {rows.length === 0 ? (
          <div style={{ color: 'var(--text-2)' }}>Пока нет назначенных рецензий.</div>
        ) : (
          <table className="ui-table">
            <thead>
              <tr>
                <th>Статья</th>
                <th>Журнал</th>
                <th>Due</th>
                <th>Decision</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 800 }}>{r.submission.title}</td>
                  <td style={{ color: 'var(--text-2)' }}>{r.submission.journal.title}</td>
                  <td style={{ color: 'var(--text-2)' }}>{r.dueAt ? new Date(r.dueAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className="ui-pill">{r.decision ?? '—'}</span>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

