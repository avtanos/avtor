import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'
import { useToasts } from '../app/toasts'
import { useI18n } from '../app/i18n'

export function RegisterPage() {
  const { t } = useI18n()
  const [fullName, setFullName] = useState('Демо Пользователь')
  const [email, setEmail] = useState(`demo${Math.floor(Math.random() * 10000)}@example.com`)
  const [password, setPassword] = useState('ChangeMe123!')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { push } = useToasts()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const user = await api.register({ email, password, fullName })
      push({ type: 'success', title: t('toast.register.ok'), message: user.email })
      navigate('/login')
    } catch (err: any) {
      push({ type: 'error', title: t('toast.register.fail'), message: err?.error ?? 'REGISTER_FAILED' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout
      title={t('auth.register.title')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('auth.register.title') },
      ]}
      actions={
        <>
          <Link className="ui-button ghost" to="/login" style={{ textDecoration: 'none' }}>
            {t('auth.backToLogin')}
          </Link>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14, maxWidth: 820 }}>
        <div style={{ fontWeight: 950, color: '#fff' }}>{t('auth.register.create')}</div>
        <div style={{ marginTop: 8, color: 'var(--text-2)' }}>{t('auth.register.subtitle')}</div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 12, maxWidth: 520 }}>
          <label style={labelStyle}>
            {t('auth.register.fullName')}
            <input className="ui-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label style={labelStyle}>
            {t('auth.register.email')}
            <input className="ui-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={labelStyle}>
            {t('auth.register.password')}
            <input className="ui-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </label>
          <label style={labelStyle}>
            {t('auth.register.country')}
            <input className="ui-input" placeholder={`${t('auth.register.country')} (${t('home.mvpHint')})`} />
          </label>
          <label style={labelStyle}>
            {t('auth.register.org')}
            <input className="ui-input" placeholder={`${t('auth.register.org')} (${t('home.mvpHint')})`} />
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-2)', fontSize: 13 }}>
            <input type="checkbox" defaultChecked /> {t('auth.register.agree')}
          </label>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="ui-button primary" disabled={busy}>
              {busy ? '...' : t('auth.register.title')}
            </button>
            <button className="ui-button" type="button" onClick={() => push({ type: 'info', title: t('toast.mvp') })}>
              {t('auth.register.orcid')}
            </button>
            <button className="ui-button" type="button" onClick={() => push({ type: 'info', title: t('toast.mvp') })}>
              {t('auth.register.google')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }

