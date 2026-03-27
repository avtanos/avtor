import type { Me } from './auth'

export type GlobalRole = 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'PUBLISHER' | 'READER'
export type JournalRole =
  | 'JOURNAL_MANAGER'
  | 'EDITOR_IN_CHIEF'
  | 'SECTION_EDITOR'
  | 'TECHNICAL_EDITOR'
  | 'COPY_EDITOR'
  | 'LAYOUT_EDITOR'
  | 'STATISTICAL_EDITOR'
  | 'REVIEWER'
  | 'AUTHOR'

const EDITORIAL_ROLES: JournalRole[] = [
  'JOURNAL_MANAGER',
  'EDITOR_IN_CHIEF',
  'SECTION_EDITOR',
  'TECHNICAL_EDITOR',
  'COPY_EDITOR',
  'LAYOUT_EDITOR',
  'STATISTICAL_EDITOR',
]

export function hasGlobalRole(me: Me | null, roles: GlobalRole[]) {
  if (!me) return false
  const set = new Set((me.globalRoles ?? []).map((r) => r.role as GlobalRole))
  return roles.some((r) => set.has(r))
}

export function hasAnyJournalRole(me: Me | null, roles: JournalRole[]) {
  if (!me) return false
  const set = new Set((me.journalRoles ?? []).map((r) => r.role as JournalRole))
  return roles.some((r) => set.has(r))
}

export function canAuthor(me: Me | null) {
  // Авторский кабинет доступен всем аутентифицированным (даже без явной роли) — чтобы не блокировать MVP.
  return !!me
}

export function canReviewer(me: Me | null) {
  return hasAnyJournalRole(me, ['REVIEWER'])
}

export function canEditor(me: Me | null) {
  return hasAnyJournalRole(me, EDITORIAL_ROLES)
}

export function canAdmin(me: Me | null) {
  // Platform/admin доступ только глобальным ролям.
  return hasGlobalRole(me, ['SUPER_ADMIN', 'PLATFORM_ADMIN'])
}

export function primaryCabinetPath(me: Me | null) {
  if (!me) return '/login'
  if (canAdmin(me)) return '/admin'
  if (canEditor(me)) return '/cabinet/editor'
  if (canReviewer(me)) return '/cabinet/reviewer'
  return '/cabinet/author'
}

