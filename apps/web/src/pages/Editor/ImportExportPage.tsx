import { Layout } from '../../components/Layout'
import { useI18n } from '../../app/i18n'

export function ImportExportPage() {
  const { t } = useI18n()
  return (
    <Layout
      title={t('nav.importExport')}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.importExport') },
      ]}
    >
      <div className="split-2">
        <div className="ui-card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 950, color: '#fff' }}>Экспорт</div>
          <div className="split-2" style={{ marginTop: 10 }}>
            <label style={labelStyle}>
              Тип данных
              <select className="ui-select">
                <option>Articles</option>
                <option>Issues</option>
                <option>Users</option>
              </select>
            </label>
            <label style={labelStyle}>
              Формат
              <select className="ui-select">
                <option>JATS XML</option>
                <option>JSON</option>
                <option>XML</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="ui-button primary">Сформировать экспорт</button>
          </div>
        </div>

        <div className="ui-card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 950, color: '#fff' }}>Импорт</div>
          <div style={{ marginTop: 10, color: 'var(--text-2)' }}>
            Поддержка миграции пользователей из OJS и batch import metadata (MVP-заглушка).
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="ui-button">Загрузить XML</button>
            <button className="ui-button primary">Начать импорт</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }

