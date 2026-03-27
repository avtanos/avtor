import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { useAuth } from '../../app/auth'
import { useI18n } from '../../app/i18n'
import { canAdmin, canAuthor, canEditor, canReviewer, primaryCabinetPath } from '../../app/rbac'

export function CabinetHomePage() {
  const { me } = useAuth()
  const { t } = useI18n()
  const loc = useLocation()

  if (!me) return <Navigate to="/login" replace />

  // Если пользователь попал на неразрешённый раздел кабинета — отправляем в доступный.
  const p = loc.pathname
  if (p.endsWith('/cabinet') || p.endsWith('/cabinet/')) {
    const to = primaryCabinetPath(me)
    return <Navigate to={to.startsWith('/cabinet') ? to : '/cabinet/author'} replace />
  }
  if (p.includes('/cabinet/editor') && !canEditor(me)) return <Navigate to="/forbidden" replace />
  if (p.includes('/cabinet/reviewer') && !canReviewer(me)) return <Navigate to="/forbidden" replace />
  if (p.includes('/cabinet/author') && !canAuthor(me)) return <Navigate to="/forbidden" replace />

  return (
    <Layout
      title={t('cabinet.title')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('cabinet.title') },
      ]}
    >
      <div className="cabinet-shell">
        <aside className="cabinet-menu ui-card">
          <div className="cabinet-menu-title">{t('cabinet.title')}</div>
          <div className="cabinet-menu-section">{t('cabinet.sections')}</div>
          <nav className="cabinet-menu-nav">
            {canAuthor(me) ? (
              <NavLink to="/cabinet/author" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span>Кабинет автора</span>
              </NavLink>
            ) : null}
            {canReviewer(me) ? (
              <NavLink to="/cabinet/reviewer" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span>Кабинет рецензента</span>
              </NavLink>
            ) : null}
            {canEditor(me) ? (
              <NavLink to="/cabinet/editor" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span>Кабинет редактора</span>
              </NavLink>
            ) : null}
            {canAdmin(me) ? (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span>{t('nav.admin')}</span>
              </NavLink>
            ) : null}
          </nav>

          <div className="cabinet-menu-divider" />

          <div className="cabinet-menu-section">{t('cabinet.roles')}</div>
          <div className="cabinet-badges">
            {(me.globalRoles ?? []).map((r) => (
              <span key={r.role} className="ui-pill">
                {r.role}
              </span>
            ))}
            {(me.journalRoles ?? []).slice(0, 6).map((r) => (
              <span key={`${r.journalId}-${r.role}`} className="ui-pill">
                {r.role}
              </span>
            ))}
            {me.journalRoles?.length ? null : <span className="ui-pill">{t('cabinet.noJournalRoles')}</span>}
          </div>
        </aside>

        <div style={{ minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </Layout>
  )
}
