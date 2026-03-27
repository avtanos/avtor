import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useI18n } from '../app/i18n'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export function HomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState({
    journals: 0,
    publishers: 0,
    articles: 0,
    researchers: 0,
  })

  useEffect(() => {
    api
      .listJournals()
      .then((j) => setMetrics((m) => ({ ...m, journals: j.length })))
      .catch(() => {})
  }, [])

  return (
    <Layout title={t('nav.home')} crumbs={[{ label: t('nav.home') }]} variant="public">
      <div className="hero">
        <div>
          <h2 style={{ margin: 0 }}>{t('home.title')}</h2>
          <p>{t('home.subtitle')}</p>

          <div className="split-search" style={{ maxWidth: 860 }}>
            <input
              className="ui-input"
              placeholder={t('home.searchPlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (e.target as HTMLInputElement).value
                  navigate(`/search?q=${encodeURIComponent(q)}`)
                }
              }}
              style={{ background: '#fff' }}
            />
            <button className="btn-primary" onClick={() => navigate('/search')} style={{ background: '#fff', borderColor: '#fff', color: '#0b2f5f' }}>
              {t('nav.search')}
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <Link to="/search" style={{ color: '#deebff', textDecoration: 'none', fontWeight: 800 }}>
              {t('home.advancedSearch')} →
            </Link>
          </div>
        </div>

        <div className="hero-grid">
          <div className="mini-card">
            <div style={{ opacity: 0.9, fontWeight: 800 }}>{t('home.metrics.journals')}</div>
            <div className="num">{metrics.journals.toLocaleString()}</div>
          </div>
          <div className="mini-card">
            <div style={{ opacity: 0.9, fontWeight: 800 }}>{t('home.metrics.articles')}</div>
            <div className="num">{metrics.articles.toLocaleString()}</div>
          </div>
          <div className="mini-card">
            <div style={{ opacity: 0.9, fontWeight: 800 }}>{t('home.metrics.publishers')}</div>
            <div className="num">{metrics.publishers.toLocaleString()}</div>
          </div>
          <div className="mini-card">
            <div style={{ opacity: 0.9, fontWeight: 800 }}>{t('home.metrics.researchers')}</div>
            <div className="num">{metrics.researchers.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="section">
        <div className="section-head">
          <div>
            <h3>Ключевые разделы</h3>
            <p>Основные функции платформы для авторов, журналов и читателей.</p>
          </div>
          <Link to="/search" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 900 }}>
            Весь функционал →
          </Link>
        </div>

        <div className="key-grid">
          <KeyCard icon="journals" title="Журналы" text="Каталог научных журналов и сведения о редакционных политиках." to="/journals" />
          <KeyCard icon="publishers" title="Издатели" text="Профили издателей и перечень их журналов." to="/publishers" />
          <KeyCard icon="researchers" title="Исследователи" text="Профили авторов и их публикационная активность." to="/researchers" />
          <KeyCard icon="subjects" title="Тематики" text="Области науки и дисциплины для поиска журналов и статей." to="/subjects" />
          <KeyCard icon="search" title="Расширенный поиск" text="Поиск по статьям, авторам, журналам, ключевым словам." to="/search" />
          <KeyCard icon="submit" title="Подача статьи" text="Создание заявки и отслеживание статуса (MVP)." to="/submit" />
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="two-col">
        <div className="ui-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontWeight: 950, color: '#fff', fontSize: 18 }}>{t('home.recommended')}</div>
            <Link to="/journals" style={{ color: 'rgba(167,139,250,0.92)', textDecoration: 'none', fontWeight: 800 }}>
              {t('nav.journals')} →
            </Link>
          </div>
          <div style={{ marginTop: 12, color: 'var(--text-2)' }}>
            {t('home.recoText')}
          </div>
        </div>

        <div className="ui-card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 950, color: '#fff', fontSize: 18 }}>{t('home.announcements')}</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <Announcement title={t('home.ann.m1')} date="2026-03-26" />
            <Announcement title={t('home.ann.m2')} date="2026-03-26" />
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="ui-card cta" style={{ padding: 18 }}>
        <div className="cta-inner">
          <div>
            <div style={{ fontWeight: 950, color: 'var(--title)', fontSize: 18 }}>Готовы поделиться своими исследованиями?</div>
            <div style={{ marginTop: 6, color: 'var(--text-2)', fontSize: 13 }}>
              Подайте статью в выбранный журнал и отслеживайте этапы рассмотрения.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/submit')}>
              Подать статью
            </button>
            <button className="btn-chip" onClick={() => navigate('/register')}>
              Регистрация
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function KeyCard({ icon, title, text, to }: { icon: IconName; title: string; text: string; to: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="ui-card key-card">
        <div className="key-top">
          <div className="key-ic">{iconEl(icon)}</div>
          <div className="key-title">{title}</div>
        </div>
        <div className="key-text">{text}</div>
        <div className="key-link">Перейти →</div>
      </div>
    </Link>
  )
}

type IconName = 'journals' | 'publishers' | 'researchers' | 'subjects' | 'search' | 'submit'

function iconEl(name: IconName) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' as const }
  switch (name) {
    case 'journals':
      return (
        <svg {...common}>
          <path d="M7 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
          <path d="M7 4v16" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'publishers':
      return (
        <svg {...common}>
          <path d="M4 21V9l8-4 8 4v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 21v-8h6v8" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'researchers':
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'subjects':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'submit':
      return (
        <svg {...common}>
          <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
  }
}

function Announcement({ title, date }: { title: string; date: string }) {
  const { t } = useI18n()
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontWeight: 900, color: 'rgba(255,255,255,0.92)' }}>{title}</div>
      <div style={{ marginTop: 4, color: 'var(--text-2)', fontSize: 13 }}>{date}</div>
      <button className="ui-button ghost" style={{ marginTop: 10 }}>
        {t('home.more')}
      </button>
    </div>
  )
}

