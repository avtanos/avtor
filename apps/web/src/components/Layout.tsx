import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useI18n } from '../app/i18n'
import { useAuth } from '../app/auth'
import { useInbox } from '../app/inbox'
import { canAdmin, canAuthor, canEditor, primaryCabinetPath } from '../app/rbac'

export function Layout({
  title,
  crumbs,
  actions,
  children,
  variant = 'app',
}: {
  title: string
  crumbs?: Array<{ label: string; to?: string }>
  actions?: React.ReactNode
  children: React.ReactNode
  variant?: 'app' | 'public'
}) {
  const { lang, setLang, t } = useI18n()
  const { me, logout } = useAuth()
  const inbox = useInbox()
  const navigate = useNavigate()

  if (variant === 'public') {
    return (
      <div className="public">
        <header className="public-header">
          <div className="public-header-inner">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
              <div className="logo-mark">IO</div>
              <div className="logo-text">
                <div className="logo-title">Ilim Ordo</div>
                <div className="logo-sub">{t('layout.subtitle')}</div>
              </div>
            </Link>

            <nav className="public-nav">
              <NavLink to="/journals">Журналы</NavLink>
              <NavLink to="/publishers">Издатели</NavLink>
              <NavLink to="/researchers">Исследователи</NavLink>
              <NavLink to="/subjects">Тематики</NavLink>
              <NavLink to="/search">Поиск</NavLink>
            </nav>

            <div className="public-actions">
              <div className="lang-switch">
                <button className={lang === 'ru' ? 'btn-chip active' : 'btn-chip'} onClick={() => setLang('ru')}>
                  RU
                </button>
                <button className={lang === 'ky' ? 'btn-chip active' : 'btn-chip'} onClick={() => setLang('ky')}>
                  KY
                </button>
              </div>

              {me ? (
                <>
                  <button className="btn-chip" onClick={() => navigate(primaryCabinetPath(me))}>
                    Кабинет
                  </button>
                  <button className="btn-chip" onClick={() => { logout(); navigate('/login') }}>
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-chip" onClick={() => navigate('/login')}>
                    {t('nav.login')}
                  </button>
                  <button className="btn-primary" onClick={() => navigate('/cabinet/author')}>
                    Кабинет автора
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="public-content">
          <div className="container">
            {crumbs?.length ? (
              <div className="breadcrumbs">
                {crumbs.map((c, idx) => (
                  <span key={`${c.label}-${idx}`}>
                    {c.to ? (
                      <Link to={c.to} style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
                        {c.label}
                      </Link>
                    ) : (
                      <span style={{ fontWeight: 800 }}>{c.label}</span>
                    )}
                    {idx < crumbs.length - 1 ? <span style={{ opacity: 0.45 }}> / </span> : null}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="page-head">
              <div>
                <div className="page-title">{title}</div>
              </div>
              {actions ? <div className="page-actions">{actions}</div> : null}
            </div>

            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar sidebar-light">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="brand brand-light">
            <div className="brand-mark brand-mark-light">IO</div>
            <div>
              <h1>Ilim Ordo</h1>
              <p>{t('layout.subtitle')}</p>
            </div>
          </div>
        </Link>

        <NavGroup title={t('sidebar.main')} items={[
          { to: '/', label: t('nav.home'), code: '01' },
          { to: '/journals', label: t('nav.journals'), code: '02' },
          { to: '/publishers', label: t('nav.publishers'), code: '03' },
          { to: '/researchers', label: t('nav.researchers'), code: '04' },
          { to: '/subjects', label: t('nav.subjects'), code: '05' },
          { to: '/search', label: t('nav.search'), code: '06' },
        ]} />

        {me ? (
          <>
            {canAuthor(me) ? (
              <NavGroup
                title={t('sidebar.author')}
                items={[
                  { to: '/cabinet/author', label: t('nav.myArticles'), code: '07' },
                  { to: '/submit', label: t('nav.newSubmission'), code: '08' },
                  { to: '/messages', label: t('nav.messages'), code: '09' },
                  { to: '/notifications', label: t('nav.notifications'), code: '10' },
                  { to: '/profile', label: t('nav.profile'), code: '11' },
                ]}
              />
            ) : null}

            {canEditor(me) ? (
              <NavGroup
                title={t('sidebar.editorial')}
                items={[
                  { to: '/editor/dashboard', label: t('nav.editorDashboard'), code: '12' },
                  { to: '/editor/articles', label: t('nav.editorArticles'), code: '13' },
                  { to: '/editor/workflow', label: t('nav.workflow'), code: '14' },
                  { to: '/editor/reviewers', label: t('nav.reviewers'), code: '15' },
                  { to: '/editor/users', label: t('nav.journalUsers'), code: '16' },
                  { to: '/editor/issues', label: t('nav.issues'), code: '17' },
                  { to: '/editor/pages', label: t('nav.journalPages'), code: '18' },
                  { to: '/editor/settings', label: t('nav.journalSettings'), code: '18a' },
                  { to: '/editor/indexes', label: t('nav.indexes'), code: '19' },
                  { to: '/editor/email-templates', label: t('nav.emailTemplates'), code: '20' },
                  { to: '/editor/imports', label: t('nav.importExport'), code: '21' },
                  { to: '/editor/doi', label: t('nav.doi'), code: '22' },
                ]}
              />
            ) : null}

            {canAdmin(me) ? (
              <NavGroup
                title={t('sidebar.platform')}
                items={[
                  { to: '/admin', label: t('nav.admin'), code: '23' },
                ]}
              />
            ) : null}
          </>
        ) : null}

        <div className="nav-group">
          <div className="nav-title">{t('common.language')}</div>
          <div style={{ display: 'flex', gap: 10, padding: '0 10px' }}>
            <button className={`btn-chip ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
            <button className={`btn-chip ${lang === 'ky' ? 'active' : ''}`} onClick={() => setLang('ky')}>KY</button>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-title">{t('common.session')}</div>
          <div style={{ padding: '0 10px', color: 'var(--text-2)', fontSize: 13 }}>
            {me ? (
              <>
                <div style={{ fontWeight: 800, color: 'var(--title)' }}>{me.fullName ?? me.email}</div>
                <div>{me.email}</div>
                <div style={{ marginTop: 10 }}>
                  <button className="btn-chip" onClick={() => { logout(); navigate('/login') }}>
                    {t('common.logout')}
                  </button>
                </div>
              </>
            ) : (
              <div>
                {t('common.guest')}
                <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-chip" onClick={() => navigate('/login')}>{t('nav.login')}</button>
                  <button className="btn-primary" onClick={() => navigate('/register')}>{t('nav.register')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <GlobalSearch />
          <div className="top-actions">
            {me && canAuthor(me) ? (
              <>
                <button className="btn-chip" onClick={() => navigate('/notifications')}>🔔 {inbox.unreadNotifications}</button>
                <button className="btn-chip" onClick={() => navigate('/messages')}>✉ {inbox.unreadThreads}</button>
                <button className="btn-primary" onClick={() => navigate('/submit')}>
                  {t('home.submit')}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          {crumbs?.length ? (
              <div className="breadcrumbs" style={{ marginBottom: 10 }}>
                {crumbs.map((c, idx) => (
                  <span key={`${c.label}-${idx}`}>
                    {c.to ? (
                      <Link to={c.to} style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
                        {c.label}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--title)', fontWeight: 800 }}>{c.label}</span>
                    )}
                    {idx < crumbs.length - 1 ? <span style={{ opacity: 0.45 }}> / </span> : null}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--title)', letterSpacing: -0.2 }}>{title}</div>
                <div style={{ marginTop: 6, color: 'var(--text-2)' }}>
                  {t('layout.subtitle')}
                </div>
              </div>
              {actions ? <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div> : null}
            </div>

            {children}
          </div>
      </main>
    </div>
  )
}

function NavGroup({
  title,
  items,
}: {
  title: string
  items: Array<{ to: string; label: string; code: string }>
}) {
  return (
    <div className="nav-group">
      <div className="nav-title">{title}</div>
      <nav className="nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span>{it.label}</span>
            <small>{it.code}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function GlobalSearch() {
  const navigate = useNavigate()
  return (
    <div className="search">
      <span>🔎</span>
      <input
        type="text"
        placeholder="Поиск по статьям, DOI, журналам, авторам"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const q = (e.target as HTMLInputElement).value
            navigate(`/search?q=${encodeURIComponent(q)}`)
          }
        }}
      />
    </div>
  )
}

