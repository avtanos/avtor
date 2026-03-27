export const mockData = {
  publishers: [
    { id: 'pub-1', title: 'Kyrgyz National University Press', desc: '12 журналов • 4 активных выпуска • 18 редакторов' },
    { id: 'pub-2', title: 'Central Asian Research Center', desc: '7 журналов • DOI sponsor • 3 special issues' },
    { id: 'pub-3', title: 'Association of Medical Informatics', desc: '4 журнала • 296 опубликованных статей за год' },
    { id: 'pub-4', title: 'Engineering Science Foundation', desc: '9 журналов • 52 выпуска в архиве • 42 000+ скачиваний' },
  ],
  researchers: [
    {
      id: 'res-1',
      name: 'Dr. Aizada Temirova',
      desc: 'ORCID: 0000-0002-1234-5678\n12 публикаций • 3 активных рецензии',
      pill: 'Data Governance',
      action: 'Подписаться',
    },
    {
      id: 'res-2',
      name: 'Prof. Murat Asanov',
      desc: 'ORCID подключён • Член редколлегии • 28 цитирований в этом году',
      pill: 'Construction IT',
      action: 'Открыть профиль',
    },
    {
      id: 'res-3',
      name: 'Dr. Cholpon Ibraeva',
      desc: 'Рейтинг рецензента 4.8 • 9 завершённых рецензий • Health Systems',
      pill: 'Health Data',
      action: 'Назначить рецензентом',
    },
    {
      id: 'res-4',
      name: 'Dr. Bakyt Doolotov',
      desc: 'Scopus Author ID подключён • 17 публикаций • 2 grant projects',
      pill: 'AI in Education',
      action: 'Открыть профиль',
    },
  ],
  subjects: [
    { id: 'sub-1', title: 'Artificial Intelligence', desc: '184 журнала • 24 000+ статей' },
    { id: 'sub-2', title: 'Health Informatics', desc: '92 журнала • 11 200+ статей' },
    { id: 'sub-3', title: 'Construction Analytics', desc: '37 журналов • 4 600+ статей' },
    { id: 'sub-4', title: 'Environmental Sciences', desc: '76 журналов • 8 940+ статей' },
    { id: 'sub-5', title: 'Economics & Policy', desc: '121 журнал • 15 300+ статей' },
    { id: 'sub-6', title: 'Language Technologies', desc: '28 журналов • 2 940+ статей' },
  ],
  journalPublic: {
    stats: [
      { label: 'Articles', value: '1 246' },
      { label: 'Views', value: '4.3M' },
      { label: 'Downloads', value: '812K' },
      { label: 'Favorites', value: '17.4K' },
    ],
    latestArticles: [
      'AI-assisted peer review quality metrics in regional journals',
      'Ethical policy automation for scholarly publishing workflows',
      'Crossref DOI deposit pipelines in multilingual platforms',
    ],
  },
  editorDashboard: [
    { title: 'Новые submission', value: '23', note: '5 без назначения' },
    { title: 'Reviewer invited', value: '18', note: '7 ожидают ответа' },
    { title: 'Revision requested', value: '11', note: '3 пришли сегодня' },
    { title: 'Avg review time', value: '21д', note: '-2 дня к прошлому месяцу' },
  ],
  journalUsers: [
    { name: 'Aizada Temirova', email: 'a.temirova@example.org', role: 'Author', status: 'Active', joined: '02.01.2026', actions: 'Change role • Send email' },
    { name: 'Cholpon Ibraeva', email: 'c.ibraeva@example.org', role: 'Reviewer', status: 'Approved', joined: '18.02.2026', actions: 'View • Invite' },
    { name: 'Murat Asanov', email: 'm.asanov@example.org', role: 'Section Editor', status: 'Assigned', joined: '11.12.2025', actions: 'Edit permissions' },
    { name: 'Nurzhan Tynystanov', email: 'n.tynystanov@example.org', role: 'Copy Editor', status: 'Active', joined: '24.02.2026', actions: 'Assign tasks' },
  ],
  indexes: [
    { index: 'Scopus', type: 'Citation', url: 'scopus.com/sourceid/123456', verification: 'Verified', actions: 'Edit • Remove' },
    { index: 'TR Index', type: 'Citation', url: 'trdizin.gov.tr/journal/abc', verification: 'Verified', actions: 'Edit' },
    { index: 'OpenAIRE', type: 'Other', url: 'openaire.eu/journal/abc', verification: 'Pending', actions: 'Verify' },
    { index: 'DOAJ', type: 'Open Access', url: 'doaj.org/toc/xxxx-xxxx', verification: 'Verified', actions: 'Edit' },
  ],
  emailTemplates: [
    { code: 'reviewer_invite', event: 'Приглашение рецензента', language: 'EN', status: 'Enabled', actions: 'Edit • Preview' },
    { code: 'revision_request', event: 'Запрос revision', language: 'RU', status: 'Enabled', actions: 'Edit • Test' },
    { code: 'article_published', event: 'Статья опубликована', language: 'EN', status: 'Default', actions: 'Customize' },
    { code: 'decision_reject', event: 'Отклонение статьи', language: 'RU', status: 'Enabled', actions: 'Edit • Test' },
  ],
  doiCards: [
    { title: 'DOI Service', desc: 'Статус: Approved\nПрефикс: 10.12345', action: 'Открыть настройки' },
    { title: 'National ID', desc: 'Автоматическая генерация на этапе submission.', action: 'Посмотреть схему' },
    { title: 'Crossref Deposit', desc: 'Последний deposit: 26.03.2026 • 12 records', action: 'Журнал событий' },
  ],
  adminCards: [
    { title: 'Журналы платформы', desc: '2 537 активных журналов', action: 'Открыть реестр' },
    { title: 'Пользователи', desc: '876 745 аккаунтов • 94% verified', action: 'Открыть реестр' },
    { title: 'Справочники', desc: 'Языки, статусы, типы статей, индексы, уведомления', action: 'Открыть' },
    { title: 'Платформенные события', desc: 'Последние 24ч: 18 245 действий пользователей', action: 'Открыть логи' },
  ],
  editorCabinetHighlights: [
    { title: 'Статей под контролем', value: '46', note: '15 в рецензировании' },
    { title: 'Рецензентов онлайн', value: '12', note: '4 новых ответа сегодня' },
    { title: 'Выпуски в работе', value: '3', note: '1 готов к публикации' },
  ],
  reviewerTips: [
    'Срок отклика на приглашение: 3 дня',
    'Средний дедлайн рецензии: 14 дней',
    'Рекомендуется минимум 3 конструктивных замечания',
  ],
  searchResults: [
    { title: 'Knowledge graph methods for journal indexing quality', journal: 'Journal of Data Science', year: '2026', doi: '10.12345/jds.2026.001' },
    { title: 'Editorial workflow optimization in multilingual publishing', journal: 'Central Asian Informatics', year: '2025', doi: '10.12345/cai.2025.044' },
    { title: 'Transparency metrics in peer review systems', journal: 'Open Science Review', year: '2024', doi: '10.12345/osr.2024.018' },
  ],
} as const;

