import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { useAuth } from '../app/auth'
import { primaryCabinetPath } from '../app/rbac'
import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const { t } = useI18n()
  const { me } = useAuth()
  const navigate = useNavigate()

  return (
    <Layout
      title={t('forbidden.title')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('forbidden.title') },
      ]}
      actions={
        <button className="btn-chip" onClick={() => navigate(primaryCabinetPath(me))}>
          {t('forbidden.back')}
        </button>
      }
    >
      <div className="ui-card" style={{ padding: 14, maxWidth: 760 }}>
        <div style={{ color: 'var(--text-2)' }}>{t('forbidden.subtitle')}</div>
      </div>
    </Layout>
  )
}

