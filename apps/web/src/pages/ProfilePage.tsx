import { Layout } from '../components/Layout'
import { useAuth } from '../app/auth'
import { useI18n } from '../app/i18n'
import { mockData } from '../mock/mockData'

export function ProfilePage() {
  const { me } = useAuth()
  const { t } = useI18n()

  return (
    <Layout
      title={t('nav.profile')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.profile') },
      ]}
      actions={
        <>
          <button className="ui-button">{t('common.save')}</button>
          <button className="ui-button ghost">{t('common.cancel')}</button>
        </>
      }
    >
      <div className="split-sidebar">
        <div className="ui-card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 950, color: '#fff' }}>{t('nav.profile')}</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10, maxWidth: 640 }}>
            <label style={labelStyle}>
              {t('auth.register.fullName')}
              <input className="ui-input" defaultValue={me?.fullName ?? ''} placeholder={t('auth.register.fullName')} />
            </label>
            <label style={labelStyle}>
              {t('auth.register.email')}
              <input className="ui-input" defaultValue={me?.email ?? ''} disabled />
            </label>
            <label style={labelStyle}>
              ORCID
              <input className="ui-input" defaultValue={mockData.researchers[0].desc.includes('0000-0002-1234-5678') ? '0000-0002-1234-5678' : ''} placeholder="0000-0000-0000-0000" />
            </label>
            <label style={labelStyle}>
              {t('auth.register.org')}
              <input className="ui-input" defaultValue={mockData.publishers[0].title} placeholder={t('auth.register.org')} />
            </label>
            <label style={labelStyle}>
              Биография
              <textarea className="ui-textarea" rows={4} defaultValue="Исследователь в области управления научными данными. Интересы: научные коммуникации, рецензирование, цифровые идентификаторы." placeholder="…" />
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, alignSelf: 'start', position: 'sticky', top: 84 }}>
          <div className="ui-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 950, color: '#fff' }}>Вкладки ({t('home.mvpHint')})</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <span className="ui-pill">Основное</span>
              <span className="ui-pill">Научный профиль</span>
              <span className="ui-pill">Связанные аккаунты</span>
              <span className="ui-pill">Безопасность</span>
              <span className="ui-pill">Мои журналы</span>
              <span className="ui-pill">История действий</span>
            </div>
          </div>

          <div className="ui-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 950, color: '#fff' }}>Безопасность ({t('home.mvpHint')})</div>
            <div style={{ marginTop: 10, color: 'var(--text-2)' }}>
              2FA, активные сессии и история входов появятся после расширения auth-сервиса.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }

