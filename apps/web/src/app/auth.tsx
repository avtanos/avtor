import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearTokens } from '../lib/api'
import { primaryCabinetPath } from './rbac'

export type Me = {
  id: string
  email: string
  fullName: string | null
  emailVerified: boolean
  globalRoles: Array<{ role: string }>
  journalRoles: Array<{ journalId: string; role: string }>
}

type AuthCtx = {
  me: Me | null
  refreshMe: () => Promise<void>
  logout: () => void
  homeAfterLogin: () => string
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)

  async function refreshMe() {
    try {
      const m = await api.me()
      setMe(m)
    } catch {
      setMe(null)
    }
  }

  function logout() {
    clearTokens()
    setMe(null)
  }

  useEffect(() => {
    void refreshMe()
  }, [])

  const value = useMemo<AuthCtx>(() => ({ me, refreshMe, logout, homeAfterLogin: () => primaryCabinetPath(me) }), [me])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

