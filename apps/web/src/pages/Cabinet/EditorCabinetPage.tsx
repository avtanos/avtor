import { useI18n } from '../../app/i18n'
import { mockData } from '../../mock/mockData'

export function EditorCabinetPage() {
  const { t } = useI18n()
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="ui-card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 950, color: '#fff' }}>{t('cabinet.editor')}</div>
        <div style={{ marginTop: 10, color: 'var(--text-2)' }}>
          Краткая сводка редактора по текущему журналу.
        </div>
      </div>

      <div className="split-3">
        {mockData.editorCabinetHighlights.map((x) => (
          <div key={x.title} className="ui-card" style={{ padding: 14 }}>
            <div style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 800 }}>{x.title}</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 950, color: '#fff' }}>{x.value}</div>
            <div style={{ marginTop: 8, color: 'var(--text-2)' }}>{x.note}</div>
          </div>
        ))}
      </div>

      <div className="ui-card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 900, color: '#fff' }}>Что дальше</div>
        <div style={{ marginTop: 10, color: 'var(--text-2)', display: 'grid', gap: 6 }}>
          <div>- Реестр статей с фильтрами по assigned editor</div>
          <div>- Workflow с переходами статусов и SLA</div>
          <div>- Контроль рецензентов и решений по статьям</div>
        </div>
      </div>
    </div>
  )
}

