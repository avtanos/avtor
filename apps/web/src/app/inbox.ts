import { useEffect, useMemo, useState } from 'react'

export type Notification = {
  id: string
  title: string
  text: string
  createdAt: string
  unread: boolean
  tone: 'blue' | 'yellow' | 'green' | 'gray'
}

export type Thread = {
  id: string
  title: string
  unreadCount: number
  lastMessageAt: string
  messages: Array<{ by: 'author' | 'editor' | 'system'; text: string; at: string }>
}

const KEY = 'jmp_inbox_v1'

type InboxState = { notifications: Notification[]; threads: Thread[] }

function seed(): InboxState {
  const now = new Date().toISOString()
  return {
    notifications: [
      { id: 'n1', title: 'Назначен редактор', text: 'Статья A-1023 передана Section Editor.', createdAt: now, unread: true, tone: 'blue' },
      { id: 'n2', title: 'Запрошена revision', text: 'Срок ответа автора: 12.04.2026.', createdAt: now, unread: true, tone: 'yellow' },
      { id: 'n3', title: 'Статья опубликована', text: 'Ваш материал включен в выпуск Volume 8 Issue 2.', createdAt: now, unread: false, tone: 'green' },
    ],
    threads: [
      {
        id: 't1',
        title: 'AI-driven Public Service Design',
        unreadCount: 2,
        lastMessageAt: now,
        messages: [
          { by: 'editor', text: 'Please upload revised manuscript and response letter.', at: now },
          { by: 'author', text: 'Revision will be uploaded by tomorrow.', at: now },
        ],
      },
      { id: 't2', title: 'Health Data Exchange in Emerging Systems', unreadCount: 0, lastMessageAt: now, messages: [] },
      { id: 't3', title: 'Construction Data Pipelines', unreadCount: 0, lastMessageAt: now, messages: [] },
    ],
  }
}

function load(): InboxState {
  const raw = localStorage.getItem(KEY)
  if (!raw) return seed()
  try {
    return JSON.parse(raw) as InboxState
  } catch {
    return seed()
  }
}

function save(state: InboxState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function useInbox() {
  const [state, setState] = useState<InboxState>(() => load())

  useEffect(() => {
    save(state)
  }, [state])

  const api = useMemo(() => {
    const unreadNotifications = state.notifications.filter((n) => n.unread).length
    const unreadThreads = state.threads.reduce((s, t) => s + (t.unreadCount || 0), 0)

    return {
      state,
      unreadNotifications,
      unreadThreads,
      markAllRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, unread: false })),
          threads: s.threads.map((t) => ({ ...t, unreadCount: 0 })),
        })),
      markNotificationRead: (id: string) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        })),
      selectThread: (id: string) => {
        const t = state.threads.find((x) => x.id === id) ?? null
        if (!t) return null
        setState((s) => ({ ...s, threads: s.threads.map((x) => (x.id === id ? { ...x, unreadCount: 0 } : x)) }))
        return t
      },
      sendMessage: (threadId: string, text: string) =>
        setState((s) => ({
          ...s,
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessageAt: new Date().toISOString(),
                  messages: [...t.messages, { by: 'author', text, at: new Date().toISOString() }],
                }
              : t,
          ),
        })),
    }
  }, [state])

  return api
}

