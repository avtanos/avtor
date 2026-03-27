import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setTokens } from '../lib/api'
import { Layout } from '../components/Layout'
import { useToasts } from '../app/toasts'
import { useAuth } from '../app/auth'
import { useI18n } from '../app/i18n'

export function LoginPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { push } = useToasts()
  const { refreshMe, homeAfterLogin } = useAuth()
  const [demo, setDemo] = useState<{ password: string; users: { author: string; reviewer: string; editor: string; admin: string } } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const tokens = await api.login({ email, password })
      setTokens(tokens)
      await refreshMe()
      push({ type: 'success', title: t('toast.login.ok'), message: email })
      navigate(homeAfterLogin())
    } catch (err: any) {
      push({ type: 'error', title: t('toast.login.fail'), message: err?.error ?? 'LOGIN_FAILED' })
    } finally {
      setBusy(false)
    }
  }

  async function createDemo() {
    setBusy(true)
    try {
      const demoEmail = `demo${Math.floor(Math.random() * 10000)}@example.com`
      const demoPassword = 'ChangeMe123!'
      await api.register({ email: demoEmail, password: demoPassword, fullName: 'Демо Пользователь' })
      const tokens = await api.login({ email: demoEmail, password: demoPassword })
      setTokens(tokens)
      await refreshMe()
      push({ type: 'success', title: t('toast.login.ok'), message: demoEmail })
      navigate(homeAfterLogin())
    } catch (err: any) {
      push({ type: 'error', title: t('toast.login.fail'), message: err?.error ?? 'DEMO_FAILED' })
    } finally {
      setBusy(false)
    }
  }

  async function ensureDemo() {
    if (demo) return demo
    const d = await api.bootstrapDemoUsers()
    setDemo({ password: d.password, users: d.users })
    return { password: d.password, users: d.users }
  }

  async function loginAs(role: 'author' | 'reviewer' | 'editor' | 'admin') {
    setBusy(true)
    try {
      const d = await ensureDemo()
      const demoEmail = d.users[role]
      const demoPassword = d.password
      const tokens = await api.login({ email: demoEmail, password: demoPassword })
      setTokens(tokens)
      await refreshMe()
      push({ type: 'success', title: t('toast.login.ok'), message: demoEmail })
      navigate(homeAfterLogin())
    } catch (err: any) {
      push({ type: 'error', title: t('toast.login.fail'), message: err?.error ?? 'DEMO_ROLE_LOGIN_FAILED' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout
      title={t('auth.login.title')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('auth.login.title') },
      ]}
      actions={
        <>
          <Link className="ui-button ghost" to="/register" style={{ textDecoration: 'none' }}>
            {t('nav.register')}
          </Link>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14, maxWidth: 760 }}>
        <div className="split-2" style={{ gap: 12 }}>
          <div>
            <div style={{ fontWeight: 950, color: '#fff' }}>{t('auth.login.signIn')}</div>
            <div style={{ marginTop: 8, color: 'var(--text-2)' }}>{t('auth.login.subtitle')}</div>

            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <label style={labelStyle}>
                {t('auth.login.email')}
                <input className="ui-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@example.com" />
              </label>
              <label style={labelStyle}>
                {t('auth.login.password')}
                <input
                  className="ui-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                />
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-2)', fontSize: 13 }}>
                <input type="checkbox" defaultChecked /> {t('auth.login.remember')}
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="ui-button primary" disabled={busy}>
                  {busy ? '...' : t('auth.login.title')}
                </button>
                <button className="ui-button" type="button" disabled={busy} onClick={() => void createDemo()}>
                  Демо-аккаунт
                </button>
                <button className="ui-button" type="button" disabled={busy} onClick={() => void loginAs('author')}>
                  Войти как Автор
                </button>
                <button className="ui-button" type="button" disabled={busy} onClick={() => void loginAs('reviewer')}>
                  Войти как Рецензент
                </button>
                <button className="ui-button" type="button" disabled={busy} onClick={() => void loginAs('editor')}>
                  Войти как Редактор
                </button>
                <button className="ui-button" type="button" disabled={busy} onClick={() => void loginAs('admin')}>
                  Войти как Админ
                </button>
                <button
                  className="ui-button ghost"
                  type="button"
                  onClick={() => push({ type: 'info', title: t('toast.mvp') })}
                >
                  {t('auth.login.forgot')}
                </button>
                <button
                  className="ui-button ghost"
                  type="button"
                  onClick={() => push({ type: 'info', title: t('toast.mvp') })}
                >
                  {t('auth.login.resend')}
                </button>
              </div>
            </form>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 12 }}>
            <div style={{ fontWeight: 950, color: '#fff' }}>{t('auth.login.sso')}</div>
            <div style={{ marginTop: 8, color: 'var(--text-2)' }}>{t('auth.login.ssoSubtitle')}</div>
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              <button className="ui-button" type="button" onClick={() => push({ type: 'info', title: t('toast.mvp') })}>
                {t('auth.login.orcid')}
              </button>
              <button className="ui-button" type="button" onClick={() => push({ type: 'info', title: t('toast.mvp') })}>
                {t('auth.login.inst')}
              </button>
              <button className="ui-button" type="button" onClick={() => push({ type: 'info', title: t('toast.mvp') })}>
                {t('auth.login.egov')}
              </button>
            </div>
            <div style={{ marginTop: 14, color: 'var(--text-2)', fontSize: 13 }}>
              Подсказка: reviewer-аккаунты создаются API с паролем <code>ChangeMe123!</code> при invite (MVP).
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }

