import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'
import { api } from '../../lib/api'
import { useToasts } from '../../app/toasts'
import { useNavigate } from 'react-router-dom'

type Step = 1 | 2 | 3 | 4 | 5

type Draft = {
  step: Step
  journalId: string
  articleType: string
  language: string
  title: string
  abstract: string
  keywordsText: string
  references: string
}

const DRAFT_KEY = 'jmp_submission_draft_v1'

export function SubmissionWizardPage() {
  const { t } = useI18n()
  const { push } = useToasts()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [journals, setJournals] = useState<Array<{ id: string; title: string }>>([])

  const [draft, setDraft] = useState<Draft>(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      try {
        return JSON.parse(raw) as Draft
      } catch {}
    }
    return {
      step: 1,
      journalId: '',
      articleType: 'Research Article',
      language: 'English',
      title: '',
      abstract: '',
      keywordsText: '',
      references: '',
    }
  })

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, step }))
  }, [draft, step])

  useEffect(() => {
    api
      .listJournals()
      .then((j) => setJournals(j.map((x) => ({ id: x.id, title: x.title }))))
      .catch(() => setJournals([]))
  }, [])

  const steps = useMemo(
    () => [
      { n: 1 as const, label: '1. Manuscript Info' },
      { n: 2 as const, label: '2. Authors' },
      { n: 3 as const, label: '3. Files' },
      { n: 4 as const, label: '4. Additional Info' },
      { n: 5 as const, label: '5. Review & Submit' },
    ],
    [],
  )

  return (
    <Layout
      title={t('nav.newSubmission')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.newSubmission') },
      ]}
      actions={
        <>
          <button
            className="btn"
            onClick={() => {
              localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, step }))
              push({ type: 'success', title: 'Черновик сохранён' })
            }}
          >
            Сохранить черновик
          </button>
          <button className="btn primary" onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}>
            Далее
          </button>
        </>
      }
    >
      <div className="ui-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {steps.map((s) => (
            <button
              key={s.n}
              className={`btn ${step === s.n ? 'soft' : ''}`}
              onClick={() => setStep(s.n)}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
          {step === 1 ? <Step1 draft={draft} setDraft={setDraft} journals={journals} /> : null}
          {step === 2 ? <Step2 /> : null}
          {step === 3 ? <Step3 /> : null}
          {step === 4 ? <Step4 /> : null}
          {step === 5 ? (
            <Step5
              draft={draft}
              onSubmit={async () => {
                const keywords = draft.keywordsText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)

                const problems: string[] = []
                if (!draft.journalId) problems.push('Выберите журнал')
                if (!draft.title.trim()) problems.push('Введите название')
                if ((draft.abstract ?? '').trim().length < 50) problems.push('Аннотация минимум 50 символов')
                if (keywords.length < 3) problems.push('Ключевых слов минимум 3 (через запятую)')

                if (problems.length) {
                  push({ type: 'error', title: 'Проверьте форму', message: problems.join(' • ') })
                  return
                }

                try {
                  await api.createSubmission({
                    journalId: draft.journalId,
                    title: draft.title.trim(),
                    abstract: draft.abstract.trim(),
                    keywords,
                    language: draft.language,
                    articleType: draft.articleType,
                    references: draft.references || undefined,
                  })
                  localStorage.removeItem(DRAFT_KEY)
                  push({ type: 'success', title: 'Статья отправлена' })
                  navigate('/cabinet/author')
                } catch (e: any) {
                  push({ type: 'error', title: 'Ошибка', message: e?.error ?? 'FAILED_TO_SUBMIT' })
                }
              }}
            />
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

function Step1({
  draft,
  setDraft,
  journals,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  journals: Array<{ id: string; title: string }>
}) {
  return (
    <div className="split-2" style={{ gap: 12 }}>
      <Field label="Журнал">
        <select className="ui-select" value={draft.journalId} onChange={(e) => setDraft({ ...draft, journalId: e.target.value })}>
          <option value="">Выберите журнал…</option>
          {journals.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Тип подачи">
        <select className="ui-select" value={draft.articleType} onChange={(e) => setDraft({ ...draft, articleType: e.target.value })}>
          <option>Research Article</option>
        </select>
      </Field>
      <Field label="Оригинальный язык">
        <select className="ui-select" value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })}>
          <option>English</option>
          <option>Русский</option>
          <option>Кыргызча</option>
        </select>
      </Field>
      <Field label="Название статьи" full>
        <input className="ui-input" placeholder="Введите название статьи" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      </Field>
      <Field label="Аннотация" full>
        <textarea className="ui-textarea" placeholder="Введите abstract" value={draft.abstract} onChange={(e) => setDraft({ ...draft, abstract: e.target.value })} />
      </Field>
      <Field label="Ключевые слова">
        <input className="ui-input" placeholder="AI, governance, interoperability" value={draft.keywordsText} onChange={(e) => setDraft({ ...draft, keywordsText: e.target.value })} />
      </Field>
      <Field label="Тематика">
        <select className="ui-select">
          <option>Digital Governance</option>
        </select>
      </Field>
      <Field label="References" full>
        <textarea className="ui-textarea" placeholder="Введите список литературы" value={draft.references} onChange={(e) => setDraft({ ...draft, references: e.target.value })} />
      </Field>
    </div>
  )
}

function Step2() {
  return (
    <div>
      <div style={{ color: 'var(--text-2)' }}>Таблица соавторов (MVP-заглушка).</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="ui-button">Добавить автора</button>
        <button className="ui-button ghost">Импортировать автора</button>
      </div>
    </div>
  )
}

function Step3() {
  return (
    <div>
      <div style={{ color: 'var(--text-2)' }}>Таблица файлов и загрузчик (MVP-заглушка).</div>
      <div style={{ marginTop: 12 }}>
        <button className="ui-button">Загрузить файл</button>
      </div>
    </div>
  )
}

function Step4() {
  return (
    <div className="split-2" style={{ gap: 12 }}>
      <Field label="Project / Grant">
        <input className="ui-input" placeholder="—" />
      </Field>
      <Field label="Conflict of Interest">
        <input className="ui-input" placeholder="—" />
      </Field>
      <Field label="Suggested reviewers" full>
        <textarea className="ui-textarea" placeholder="Name, email, institution…" />
      </Field>
      <Field label="Notes to editor" full>
        <textarea className="ui-textarea" placeholder="—" />
      </Field>
    </div>
  )
}

function Step5({ draft, onSubmit }: { draft: Draft; onSubmit: () => void }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontWeight: 800 }}>Review & Submit</div>
      <div className="ui-card" style={{ padding: 14, borderRadius: 18, boxShadow: 'none', background: 'var(--panel-2)' }}>
        <div style={{ fontWeight: 700 }}>Summary</div>
        <div style={{ marginTop: 8, color: 'var(--text-2)' }}>
          <div><strong>Journal:</strong> {draft.journalId ? draft.journalId.slice(-8) : '—'}</div>
          <div><strong>Title:</strong> {draft.title || '—'}</div>
          <div><strong>Language:</strong> {draft.language}</div>
        </div>
      </div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)' }}>
        <input type="checkbox" /> статья оригинальная
      </label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)' }}>
        <input type="checkbox" /> соответствует правилам журнала
      </label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)' }}>
        <input type="checkbox" /> все авторы согласны
      </label>
      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={onSubmit}>Отправить статью</button>
        <button className="btn">Сохранить черновик</button>
      </div>
    </div>
  )
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6, color: 'var(--text-2)', fontSize: 13, gridColumn: full ? '1 / -1' : undefined }}>
      <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.90)' }}>{label}</span>
      {children}
    </label>
  )
}

