import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useI18n } from '../../app/i18n'
import { useToasts } from '../../app/toasts'
import { StatusPill } from '../../components/StatusPill'
import { DropdownActions } from '../../components/DropdownActions'
import { Pagination } from '../../components/Pagination'
import { useInbox } from '../../app/inbox'

type Row = Awaited<ReturnType<typeof api.mySubmissions>>[number]

export function AuthorCabinetPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const navigate = useNavigate()
  const inbox = useInbox()
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [tab, setTab] = useState<'all' | 'inProgress' | 'inReview' | 'published'>('all')

  async function load() {
    setBusy(true)
    try {
      const list = await api.mySubmissions()
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

  const filtered = useMemo(() => {
    switch (tab) {
      case 'inProgress':
        return rows.filter((r) => !['PUBLISHED', 'REJECTED', 'WITHDRAWN'].includes(String(r.status)))
      case 'inReview':
        return rows.filter((r) => String(r.status).includes('REVIEW'))
      case 'published':
        return rows.filter((r) => String(r.status) === 'PUBLISHED')
      case 'all':
      default:
        return rows
    }
  }, [rows, tab])

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const latest = useMemo(() => rows.slice(0, 5), [rows])

  const stats = useMemo(() => {
    const total = rows.length
    const inReview = rows.filter((r) => String(r.status).includes('REVIEW')).length
    const inProgress = rows.filter((r) => !['PUBLISHED', 'REJECTED', 'WITHDRAWN'].includes(String(r.status))).length
    const published = rows.filter((r) => String(r.status) === 'PUBLISHED').length
    return { total, inReview, inProgress, published }
  }, [rows])

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="dash-title">Кабинет автора</div>
          <div className="dash-sub">Управляйте своими публикациями и отслеживайте процесс рецензирования.</div>
        </div>
        <div className="dash-actions">
          <button className="btn-primary" onClick={() => navigate('/submit')}>
            + Подать новую статью
          </button>
          <button className="btn-chip" onClick={() => void load()} disabled={busy}>
            {t('common.refresh')}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard title="Всего статей" value={stats.total} hint="Смотреть →" onHint={() => setPage(1)} />
        <KpiCard title="В рецензировании" value={stats.inReview} hint="Перейти →" onHint={() => {}} />
        <KpiCard title="На обработке" value={stats.inProgress} hint="Перейти →" onHint={() => {}} />
        <KpiCard title="Опубликовано" value={stats.published} hint="Смотреть →" onHint={() => {}} />
      </div>

      <div className="dash-grid">
        <div className="ui-card dash-card">
          <div className="card-head">
            <div className="card-title">Мои последние статьи</div>
            <button className="btn-chip" onClick={() => setPage(1)}>
              Все статьи →
            </button>
          </div>

          {latest.length === 0 ? (
            <div className="muted">Пока нет статей. Нажмите “Подать новую статью”.</div>
          ) : (
            <div className="list">
              {latest.map((r) => (
                <div className="list-row" key={r.id}>
                  <div style={{ minWidth: 0 }}>
                    <div className="list-title">{r.title}</div>
                    <div className="list-meta">
                      <span className="pill">{r.journal.title}</span>
                      <span className="pill">{new Date(r.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="list-right">
                    <StatusPill tone={toneFor(r.status)}>{labelFor(r.status)}</StatusPill>
                    <DropdownActions
                      actions={[
                        {
                          label: 'Открыть (MVP)',
                          onClick: () => push({ type: 'info', title: 'MVP', message: 'Открыть карточку статьи' }),
                        },
                        { label: 'Сообщения', onClick: () => navigate('/messages') },
                        {
                          label: 'Отозвать (MVP)',
                          tone: 'danger',
                          onClick: () => push({ type: 'warning', title: 'MVP', message: 'Отзыв статьи будет добавлен' }),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div className="tabs">
              <button
                className={tab === 'all' ? 'tab active' : 'tab'}
                onClick={() => {
                  setTab('all')
                  setPage(1)
                }}
              >
                Все <span className="tab-badge">{rows.length}</span>
              </button>
              <button
                className={tab === 'inProgress' ? 'tab active' : 'tab'}
                onClick={() => {
                  setTab('inProgress')
                  setPage(1)
                }}
              >
                На обработке <span className="tab-badge">{rows.filter((r) => !['PUBLISHED', 'REJECTED', 'WITHDRAWN'].includes(String(r.status))).length}</span>
              </button>
              <button
                className={tab === 'inReview' ? 'tab active' : 'tab'}
                onClick={() => {
                  setTab('inReview')
                  setPage(1)
                }}
              >
                В рецензировании <span className="tab-badge">{rows.filter((r) => String(r.status).includes('REVIEW')).length}</span>
              </button>
              <button
                className={tab === 'published' ? 'tab active' : 'tab'}
                onClick={() => {
                  setTab('published')
                  setPage(1)
                }}
              >
                Опубликовано <span className="tab-badge">{rows.filter((r) => String(r.status) === 'PUBLISHED').length}</span>
              </button>
            </div>

            {pageRows.length === 0 ? (
              <div className="muted">Нет записей в выбранном разделе.</div>
            ) : (
              <div className="list" style={{ marginTop: 10 }}>
                {pageRows.map((r) => (
                  <div className="list-row" key={r.id}>
                    <div style={{ minWidth: 0 }}>
                      <div className="list-title">{r.title}</div>
                      <div className="list-meta">
                        <span className="pill">{r.journal.title}</span>
                        <span className="pill">#{r.id.slice(-8)}</span>
                        <span className="pill">{new Date(r.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="list-right">
                      <StatusPill tone={toneFor(r.status)}>{labelFor(r.status)}</StatusPill>
                      <DropdownActions
                        actions={[
                          { label: 'Открыть (MVP)', onClick: () => push({ type: 'info', title: 'MVP', message: 'Открыть карточку статьи' }) },
                          { label: 'Сообщения', onClick: () => navigate('/messages') },
                          { label: 'История (MVP)', onClick: () => push({ type: 'info', title: 'MVP', message: 'История статусов будет добавлена' }) },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-side">
          <div className="ui-card dash-card">
            <div className="card-head">
              <div className="card-title">Уведомления</div>
              <button className="btn-chip" onClick={() => navigate('/notifications')}>
                Все →
              </button>
            </div>
            <div className="muted">Непрочитано: {inbox.unreadNotifications}</div>
            <div className="list" style={{ marginTop: 10 }}>
              <div className="note-row">
                <div className="note-dot" />
                <div style={{ minWidth: 0 }}>
                  <div className="note-title">Главный редактор изменил статус статьи</div>
                  <div className="note-meta">Сегодня • {t('home.mvpHint')}</div>
                </div>
              </div>
              <div className="note-row">
                <div className="note-dot" />
                <div style={{ minWidth: 0 }}>
                  <div className="note-title">Получено новое сообщение от редакции</div>
                  <div className="note-meta">Вчера • {t('home.mvpHint')}</div>
                </div>
              </div>
              <div className="note-row">
                <div className="note-dot" />
                <div style={{ minWidth: 0 }}>
                  <div className="note-title">Статья отправлена на рецензирование</div>
                  <div className="note-meta">2 дня назад • {t('home.mvpHint')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ui-card dash-card" style={{ marginTop: 12 }}>
            <div className="card-head">
              <div className="card-title">Полезные действия</div>
            </div>
            <div className="actions-list">
              <button className="action-link" onClick={() => navigate('/submit')}>
                Подать новую статью
              </button>
              <button className="action-link" onClick={() => navigate('/cabinet/author')}>
                Посмотреть мои статьи
              </button>
              <button className="action-link" onClick={() => navigate('/profile')}>
                Редактировать профиль
              </button>
              <button className="action-link" onClick={() => navigate('/messages')}>
                Мои сообщения
              </button>
              <button className="action-link" onClick={() => push({ type: 'info', title: 'MVP', message: 'Пригласить соавторов — будет добавлено' })}>
                Пригласить соавторов
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtered.length ? (
        <div className="ui-card" style={{ padding: 14 }}>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
        </div>
      ) : null}

    </div>
  )
}

function KpiCard({
  title,
  value,
  hint,
  onHint,
}: {
  title: string
  value: number
  hint?: string
  onHint?: () => void
}) {
  return (
    <div className="ui-card kpi">
      <div className="kpi-top">
        <div className="kpi-title">{title}</div>
        {hint ? (
          <button className="kpi-link" onClick={onHint}>
            {hint}
          </button>
        ) : null}
      </div>
      <div className="kpi-value">{value.toLocaleString()}</div>
    </div>
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

function labelFor(status: string) {
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (m) => m.toUpperCase())
}

