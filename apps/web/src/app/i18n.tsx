import React, { createContext, useContext, useMemo, useState } from 'react'

export type Lang = 'ru' | 'ky'

type Dict = Record<string, { ru: string; ky: string }>

const dict: Dict = {
  'nav.home': { ru: 'Главная', ky: 'Башкы бет' },
  'nav.journals': { ru: 'Журналы', ky: 'Журналдар' },
  'nav.search': { ru: 'Поиск', ky: 'Издөө' },
  'nav.profile': { ru: 'Профиль', ky: 'Профиль' },
  'nav.login': { ru: 'Вход', ky: 'Кирүү' },
  'nav.register': { ru: 'Регистрация', ky: 'Катталуу' },

  'common.loading': { ru: 'Загрузка...', ky: 'Жүктөлүүдө…' },
  'common.apply': { ru: 'Применить', ky: 'Колдонуу' },
  'common.reset': { ru: 'Сбросить', ky: 'Тазалоо' },
  'common.save': { ru: 'Сохранить', ky: 'Сактоо' },
  'common.cancel': { ru: 'Отменить', ky: 'Жокко чыгаруу' },
  'common.create': { ru: 'Создать', ky: 'Түзүү' },
  'common.refresh': { ru: 'Обновить', ky: 'Жаңыртуу' },
  'common.logout': { ru: 'Выйти', ky: 'Чыгуу' },

  'common.language': { ru: 'Язык', ky: 'Тил' },
  'common.session': { ru: 'Сессия', ky: 'Сессия' },
  'common.guest': { ru: 'Гость', ky: 'Конок' },
  'common.tip.search': { ru: 'Подсказка: поиск', ky: 'Кеңеш: издөө' },

  'header.searchPlaceholder': {
    ru: 'Поиск (статьи, журналы, авторы)…',
    ky: 'Издөө (макалалар, журналдар, авторлор)…',
  },
  'layout.subtitle': {
    ru: 'Единая платформа для научных публикаций',
    ky: 'Илимий публикациялар үчүн бирдиктүү платформа',
  },

  'home.title': { ru: 'Национальная платформа научных журналов', ky: 'Илимий журналдардын улуттук платформасы' },
  'home.subtitle': {
    ru: 'Подача статей, рецензирование, production и публикация — в едином редакционном цикле.',
    ky: 'Макаланы тапшыруу, рецензиялоо, даярдоо жана жарыялоо — бирдиктүү редакциялык циклде.',
  },

  'home.searchPlaceholder': {
    ru: 'DOI, ISSN, название, автор, ключевые слова…',
    ky: 'DOI, ISSN, аталышы, автор, ачкыч сөздөр…',
  },
  'home.advancedSearch': { ru: 'Расширенный поиск', ky: 'Кеңейтилген издөө' },
  'home.findArticles': { ru: 'Найти статьи', ky: 'Макалаларды табуу' },
  'home.findJournal': { ru: 'Найти журнал', ky: 'Журналды табуу' },
  'home.submit': { ru: 'Подать статью', ky: 'Макала тапшыруу' },
  'home.metrics.journals': { ru: 'Журналов', ky: 'Журналдар' },
  'home.metrics.publishers': { ru: 'Издателей', ky: 'Басмаканалар' },
  'home.metrics.articles': { ru: 'Статей', ky: 'Макалалар' },
  'home.metrics.researchers': { ru: 'Исследователей', ky: 'Изилдөөчүлөр' },
  'home.recommended': { ru: 'Рекомендуемые журналы', ky: 'Сунушталган журналдар' },
  'home.announcements': { ru: 'Объявления', ky: 'Кулактандыруулар' },
  'home.more': { ru: 'Подробнее', ky: 'Толугураак' },
  'home.ann.m1': { ru: 'Запуск MVP', ky: 'MVP ишке кирди' },
  'home.ann.m2': { ru: 'Добавлен каталог журналов', ky: 'Журналдар каталогу кошулду' },
  'home.mvpHint': { ru: 'MVP', ky: 'MVP' },
  'home.recoText': {
    ru: 'В MVP рекомендации — заглушка. Дальше: теги тематики, индексы, статистика.',
    ky: 'MVPде сунуштар — убактылуу. Кийин: тематика тегдери, индекстер, статистика.',
  },

  'journals.title': { ru: 'Журналы', ky: 'Журналдар' },
  'journals.view.cards': { ru: 'Карточки', ky: 'Карточкалар' },
  'journals.view.table': { ru: 'Таблица', ky: 'Таблица' },
  'journals.filters': { ru: 'Фильтры', ky: 'Фильтрлер' },
  'journals.searchPlaceholder': { ru: 'Поиск по названию, ISSN, издателю…', ky: 'Аталыш, ISSN, басмакана боюнча…' },
  'journals.results': { ru: 'Результаты', ky: 'Натыйжалар' },
  'journals.found': { ru: 'Найдено', ky: 'Табылды' },
  'journals.createJournal': { ru: 'Создать журнал', ky: 'Журнал түзүү' },
  'journals.needLogin': {
    ru: 'Нужно войти, чтобы создать журнал. После входа вернись сюда.',
    ky: 'Журнал түзүү үчүн кирүү керек. Киргенден кийин бул жерге кайтыңыз.',
  },
  'journals.filtersReset': { ru: 'Фильтры сброшены', ky: 'Фильтрлер тазаланды' },
  'journals.filtersApplied': { ru: 'Фильтры применены (MVP)', ky: 'Фильтрлер колдонулду (MVP)' },
  'journals.refreshSession': { ru: 'Обновить сессию', ky: 'Сессияны жаңыртуу' },
  'journals.language': { ru: 'Язык', ky: 'Тил' },
  'journals.any': { ru: 'Любой', ky: 'Каалаган' },
  'journals.sort': { ru: 'Сортировка', ky: 'Сорттоо' },
  'journals.sort.newest': { ru: 'Сначала новые', ky: 'Жаңылары биринчи' },
  'journals.sort.az': { ru: 'А–Я', ky: 'А–Я' },
  'journals.openAccess': { ru: 'Open Access', ky: 'Ачык жеткиликтүү' },
  'journals.badges': { ru: 'Бейджи', ky: 'Белгилер' },
  'journals.actions': { ru: 'Действия', ky: 'Аракеттер' },
  'journals.open': { ru: 'Открыть', ky: 'Ачуу' },
  'journals.copyLink': { ru: 'Скопировать ссылку', ky: 'Шилтемени көчүрүү' },
  'journals.copied': { ru: 'Скопировано (MVP)', ky: 'Көчүрүлдү (MVP)' },
  'journals.publisher': { ru: 'Издатель', ky: 'Басмакана' },
  'journals.issn': { ru: 'ISSN', ky: 'ISSN' },
  'journals.card.openJournal': { ru: 'Открыть журнал', ky: 'Журналды ачуу' },
  'journals.card.submit': { ru: 'Подать статью', ky: 'Макала тапшыруу' },
  'journals.card.follow': { ru: 'Подписаться', ky: 'Жазылуу' },

  'auth.login.title': { ru: 'Вход', ky: 'Кирүү' },
  'auth.login.signIn': { ru: 'Войти', ky: 'Кирүү' },
  'auth.login.subtitle': {
    ru: 'Email/пароль для MVP. OAuth/ORCID будет подключён дальше.',
    ky: 'MVP үчүн email/сырсөз. OAuth/ORCID кийин кошулат.',
  },
  'auth.login.email': { ru: 'Email / username', ky: 'Email / колдонуучу аты' },
  'auth.login.password': { ru: 'Пароль', ky: 'Сырсөз' },
  'auth.login.remember': { ru: 'Запомнить меня', ky: 'Мени эстеп кал' },
  'auth.login.forgot': { ru: 'Забыли пароль?', ky: 'Сырсөздү унуттуңузбу?' },
  'auth.login.resend': { ru: 'Повторно отправить подтверждение', ky: 'Ырастоону кайра жөнөтүү' },
  'auth.login.sso': { ru: 'Единый вход', ky: 'Бирдиктүү кирүү' },
  'auth.login.ssoSubtitle': { ru: 'Кнопки-заглушки под ORCID / SSO / eGov.', ky: 'ORCID / SSO / eGov үчүн баскычтар.' },
  'auth.login.orcid': { ru: 'Войти через ORCID', ky: 'ORCID аркылуу кирүү' },
  'auth.login.inst': { ru: 'Institutional SSO', ky: 'Уюмдук SSO' },
  'auth.login.egov': { ru: 'Войти через eGov', ky: 'eGov аркылуу кирүү' },
  'auth.register.title': { ru: 'Регистрация', ky: 'Катталуу' },
  'auth.register.create': { ru: 'Создать аккаунт', ky: 'Аккаунт түзүү' },
  'auth.register.subtitle': {
    ru: 'В MVP — базовая регистрация. Дальше добавим ORCID/Google/eGov и подтверждение email.',
    ky: 'MVPде — жөнөкөй катталуу. Кийин ORCID/Google/eGov жана email ырастоосу кошулат.',
  },
  'auth.register.fullName': { ru: 'ФИО', ky: 'Аты-жөнү' },
  'auth.register.email': { ru: 'Email', ky: 'Email' },
  'auth.register.password': { ru: 'Пароль (мин. 8)', ky: 'Сырсөз (кеминде 8)' },
  'auth.register.country': { ru: 'Страна', ky: 'Өлкө' },
  'auth.register.org': { ru: 'Организация', ky: 'Уюм' },
  'auth.register.agree': { ru: 'Я согласен(на) с политикой платформы (MVP)', ky: 'Платформанын саясатына макулмун (MVP)' },
  'auth.register.orcid': { ru: 'Зарегистрироваться через ORCID', ky: 'ORCID аркылуу катталуу' },
  'auth.register.google': { ru: 'Зарегистрироваться через Google', ky: 'Google аркылуу катталуу' },
  'auth.backToLogin': { ru: 'Назад ко входу', ky: 'Кирүүгө кайтуу' },

  'toast.login.ok': { ru: 'Вы вошли', ky: 'Сиз кирдиңиз' },
  'toast.login.fail': { ru: 'Не удалось войти', ky: 'Кирүү мүмкүн болбоду' },
  'toast.register.ok': { ru: 'Аккаунт создан', ky: 'Аккаунт түзүлдү' },
  'toast.register.fail': { ru: 'Не удалось зарегистрироваться', ky: 'Катталуу мүмкүн болбоду' },
  'toast.journal.created': { ru: 'Журнал создан', ky: 'Журнал түзүлдү' },
  'toast.journal.createFail': { ru: 'Не удалось создать журнал', ky: 'Журнал түзүү мүмкүн болбоду' },
  'toast.mvp': { ru: 'Пока в разработке (MVP)', ky: 'Азырынча иштелүүдө (MVP)' },

  'forbidden.title': { ru: 'Доступ запрещён', ky: 'Кирүүгө тыюу салынган' },
  'forbidden.subtitle': { ru: 'У вашей роли нет доступа к этой странице.', ky: 'Сиздин ролуңузда бул бетке кирүү укугу жок.' },
  'forbidden.back': { ru: 'Вернуться в кабинет', ky: 'Кабинетке кайтуу' },

  'cabinet.title': { ru: 'Кабинет', ky: 'Кабинет' },
  'cabinet.sections': { ru: 'Разделы', ky: 'Бөлүмдөр' },
  'cabinet.author': { ru: 'Автор', ky: 'Автор' },
  'cabinet.reviewer': { ru: 'Рецензент', ky: 'Рецензент' },
  'cabinet.editor': { ru: 'Редактор', ky: 'Редактор' },
  'cabinet.roles': { ru: 'Роли', ky: 'Ролдор' },
  'cabinet.noJournalRoles': { ru: 'Нет ролей в журналах', ky: 'Журналдарда ролдор жок' },

  // Sidebar groups
  'sidebar.main': { ru: 'Главное', ky: 'Негизги' },
  'sidebar.author': { ru: 'Автор', ky: 'Автор' },
  'sidebar.editorial': { ru: 'Редакция', ky: 'Редакция' },
  'sidebar.platform': { ru: 'Платформа', ky: 'Платформа' },

  // Main navigation
  'nav.publishers': { ru: 'Издатели', ky: 'Басмаканалар' },
  'nav.researchers': { ru: 'Исследователи', ky: 'Изилдөөчүлөр' },
  'nav.subjects': { ru: 'Тематики', ky: 'Темалар' },

  // Author navigation
  'nav.myArticles': { ru: 'Мои статьи', ky: 'Менин макалаларым' },
  'nav.newSubmission': { ru: 'Новая подача', ky: 'Жаңы тапшыруу' },
  'nav.messages': { ru: 'Сообщения', ky: 'Билдирүүлөр' },
  'nav.notifications': { ru: 'Уведомления', ky: 'Кабарлоолор' },

  // Editorial navigation
  'nav.editorDashboard': { ru: 'Dashboard редактора', ky: 'Редактор тактасы' },
  'nav.editorArticles': { ru: 'Статьи', ky: 'Макалалар' },
  'nav.workflow': { ru: 'Workflow', ky: 'Workflow' },
  'nav.reviewers': { ru: 'Рецензенты', ky: 'Рецензенттер' },
  'nav.journalUsers': { ru: 'Пользователи журнала', ky: 'Журнал колдонуучулары' },
  'nav.issues': { ru: 'Выпуски', ky: 'Сандар' },
  'nav.journalPages': { ru: 'Страницы журнала', ky: 'Журнал барактары' },
  'nav.indexes': { ru: 'Индексы', ky: 'Индекстер' },
  'nav.emailTemplates': { ru: 'Email шаблоны', ky: 'Email шаблондору' },
  'nav.importExport': { ru: 'Импорт/Экспорт', ky: 'Импорт/Экспорт' },
  'nav.doi': { ru: 'DOI / ID', ky: 'DOI / ID' },
  'nav.journalSettings': { ru: 'Настройки журнала', ky: 'Журнал жөндөөлөрү' },

  // Platform
  'nav.admin': { ru: 'Администрирование', ky: 'Администрлөө' },

  // Journal public page
  'journalPublic.titlePrefix': { ru: 'Журнал', ky: 'Журнал' },
  'journalPublic.action.submit': { ru: 'Подать статью', ky: 'Макала тапшыруу' },
  'journalPublic.action.follow': { ru: 'Подписаться', ky: 'Жазылуу' },
  'journalPublic.action.share': { ru: 'Поделиться', ky: 'Бөлүшүү' },
  'journalPublic.badge.openAccess': { ru: 'Открытый доступ', ky: 'Ачык жеткиликтүүлүк' },
  'journalPublic.badge.active': { ru: 'Активный', ky: 'Активдүү' },
  'journalPublic.badge.indexed': { ru: 'Индексируется', ky: 'Индекстелет' },
  'journalPublic.description': {
    ru: 'Публичная страница журнала: цель и охват, правила для авторов, этическая политика, индексы, редколлегия, контакты и архив.',
    ky: 'Журналдын ачык барагы: максаты жана камтуусу, авторлор үчүн эрежелер, этикалык саясат, индекстер, редколлегия, байланыш жана архив.',
  },
  'journalPublic.stats.articles': { ru: 'Статей', ky: 'Макалалар' },
  'journalPublic.stats.views': { ru: 'Просмотры', ky: 'Көрүүлөр' },
  'journalPublic.stats.downloads': { ru: 'Жүктөөлөр', ky: 'Жүктөөлөр' },
  'journalPublic.stats.favorites': { ru: 'Избранное', ky: 'Тандалмалар' },
  'journalPublic.latest': { ru: 'Последние статьи', ky: 'Акыркы макалалар' },
  'journalPublic.menu': { ru: 'Разделы', ky: 'Бөлүмдөр' },
  'journalPublic.menu.about': { ru: 'О журнале', ky: 'Журнал жөнүндө' },
  'journalPublic.menu.aim': { ru: 'Цель и охват', ky: 'Максаты жана камтуусу' },
  'journalPublic.menu.guidelines': { ru: 'Правила для авторов', ky: 'Авторлор үчүн эрежелер' },
  'journalPublic.menu.ethical': { ru: 'Этическая политика', ky: 'Этикалык саясат' },
  'journalPublic.menu.indexes': { ru: 'Индексы', ky: 'Индекстер' },
  'journalPublic.menu.board': { ru: 'Редколлегия', ky: 'Редколлегия' },
  'journalPublic.menu.contact': { ru: 'Контакты', ky: 'Байланыш' },
  'journalPublic.menu.archive': { ru: 'Архив', ky: 'Архив' },
  'journalPublic.quickActions': { ru: 'Быстрые действия', ky: 'Тез аракеттер' },
  'journalPublic.submitArticle': { ru: 'Подать статью', ky: 'Макала тапшыруу' },
  'journalPublic.backToCatalog': { ru: 'Назад к каталогу', ky: 'Каталогго кайтуу' },
}

type I18nCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof dict | string) => string
}

const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'ru')
  const value = useMemo<I18nCtx>(() => {
    return {
      lang,
      setLang: (l) => {
        localStorage.setItem('lang', l)
        setLang(l)
      },
      t: (key) => {
        const entry = dict[key]
        return entry ? entry[lang] : key
      },
    }
  }, [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

