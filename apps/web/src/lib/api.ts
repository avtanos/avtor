const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export type ApiError = { error: string }

function getTokens() {
  return {
    accessToken: localStorage.getItem('accessToken') ?? '',
    refreshToken: localStorage.getItem('refreshToken') ?? '',
  }
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { accessToken } = getTokens()
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  const json = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    throw json ?? { error: `HTTP_${res.status}` }
  }
  return json as T
}

export const api = {
  health: () => request<{ ok: true }>('/health'),
  register: (body: { email: string; password: string; fullName?: string }) =>
    request<{ id: string; email: string; fullName: string | null }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  bootstrapDemoUsers: () =>
    request<{
      journal: { id: string; title: string; subdomain: string }
      password: string
      users: { author: string; reviewer: string; editor: string; admin: string }
    }>('/dev/demo/bootstrap', { method: 'POST' }),
  me: () =>
    request<{
      id: string
      email: string
      fullName: string | null
      emailVerified: boolean
      globalRoles: Array<{ role: string }>
      journalRoles: Array<{ journalId: string; role: string }>
    }>('/me'),
  mySubmissions: () =>
    request<
      Array<{
        id: string
        createdAt: string
        updatedAt: string
        status: string
        title: string
        language: string
        articleType: string
        journal: { id: string; title: string; subdomain: string }
      }>
    >('/me/submissions'),
  myReviews: () =>
    request<
      Array<{
        id: string
        createdAt: string
        updatedAt: string
        dueAt: string | null
        submittedAt: string | null
        decision: string | null
        submission: { id: string; title: string; status: string; journal: { id: string; title: string; subdomain: string } }
      }>
    >('/me/reviews'),
  listJournals: () =>
    request<Array<{ id: string; title: string; subdomain: string; defaultLang: string; description?: string | null; websiteUrl?: string | null }>>('/journals'),
  createJournal: (body: {
    title: string
    subdomain: string
    defaultLang?: string
    description?: string
    websiteUrl?: string
    contactEmail?: string
    contactPhone?: string
    contactAddress?: string
    aimScope?: string
    guidelines?: string
    ethicalPolicy?: string
    publicationPolicy?: string
    pricingPolicy?: string
  }) =>
    request<{ id: string; title: string; subdomain: string; defaultLang: string }>('/journals', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getJournal: (id: string) =>
    request<any>(`/journals/${id}`),
  updateJournal: (id: string, body: any) =>
    request<any>(`/journals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  getPublicJournal: (subdomain: string, lang?: string) =>
    request<{
      journal: any
      pages: Array<{
        id: string
        title: string
        slug: string
        language: string
        content: string
        published: boolean
      }>
      issues: Array<{ id: string; year: number; volume: number | null; number: number | null; title: string | null; publicationDate: string | null }>
    }>(`/public/journals/${encodeURIComponent(subdomain)}${lang ? `?lang=${encodeURIComponent(lang)}` : ''}`),
  listSubmissions: () =>
    request<
      Array<{
        id: string
        createdAt: string
        updatedAt: string
        status: string
        title: string
        language: string
        articleType: string
        journal: { id: string; title: string; subdomain: string }
        author: { id: string; email: string; fullName: string | null }
      }>
    >('/submissions'),
  updateSubmissionStatus: (id: string, status: string) =>
    request<{ id: string; status: string }>(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  inviteReviewer: (body: { submissionId: string; reviewerEmail: string; dueAt?: string }) =>
    request<{ id: string }>(`/reviews/invite`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createSubmission: (body: {
    journalId: string
    title: string
    abstract: string
    keywords: string[]
    language: string
    articleType: string
    references?: string
  }) =>
    request<{ id: string }>(`/submissions`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  becomeSuperAdmin: () => request<{ ok: true }>('/dev/become-super-admin', { method: 'POST' }),
  grantJournalRole: (journalId: string, body: { userEmail: string; role: string }) =>
    request<{ ok: true }>(`/admin/journals/${journalId}/roles/grant`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  assignEditor: (submissionId: string) =>
    request<{ id: string; handlingEditorId: string | null; status: string }>(`/submissions/${submissionId}/assign-editor`, {
      method: 'POST',
    }),

  listIssues: (journalId: string) =>
    request<
      Array<{
        id: string
        createdAt: string
        updatedAt: string
        year: number
        volume: number | null
        number: number | null
        title: string | null
        description: string | null
        coverImageUrl: string | null
        publicationDate: string | null
        status: string
      }>
    >(`/journals/${journalId}/issues`),
  createIssue: (journalId: string, body: { year: number; volume?: number; number?: number; title?: string; publicationDate?: string; status?: string }) =>
    request<{ id: string }>(`/journals/${journalId}/issues`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateIssue: (journalId: string, id: string, body: Partial<{ year: number; volume: number | null; number: number | null; title: string | null; publicationDate: string | null; status: string }>) =>
    request<{ id: string }>(`/journals/${journalId}/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteIssue: (journalId: string, id: string) =>
    request<{ ok: true }>(`/journals/${journalId}/issues/${id}`, { method: 'DELETE' }),

  listJournalPages: (journalId: string) =>
    request<
      Array<{
        id: string
        createdAt: string
        updatedAt: string
        title: string
        slug: string
        type: string
        language: string
        published: boolean
        showInRightMenu: boolean
        showInTopNav: boolean
        sortOrder: number
      }>
    >(`/journals/${journalId}/pages`),
  getJournalPage: (journalId: string, id: string) =>
    request<{
      id: string
      journalId: string
      title: string
      slug: string
      type: string
      language: string
      content: string
      seoTitle: string | null
      seoDescription: string | null
      published: boolean
      showInRightMenu: boolean
      showInTopNav: boolean
      sortOrder: number
      updatedAt: string
    }>(`/journals/${journalId}/pages/${id}`),
  createJournalPage: (journalId: string, body: {
    title: string
    slug: string
    language?: string
    content?: string
    published?: boolean
    showInRightMenu?: boolean
    showInTopNav?: boolean
    sortOrder?: number
    type?: string
  }) =>
    request<{ id: string }>(`/journals/${journalId}/pages`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateJournalPage: (
    journalId: string,
    id: string,
    body: Partial<{
      title: string
      slug: string
      language: string
      content: string
      published: boolean
      showInRightMenu: boolean
      showInTopNav: boolean
      sortOrder: number
      type: string
    }>,
  ) =>
    request<{ id: string }>(`/journals/${journalId}/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteJournalPage: (journalId: string, id: string) =>
    request<{ ok: true }>(`/journals/${journalId}/pages/${id}`, { method: 'DELETE' }),
}

