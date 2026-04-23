import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import api from '../utils/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isReady: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (stored && storedUser) {
      // Reuse existing session
      setToken(stored)
      setUser(JSON.parse(storedUser))
      setIsReady(true)
    } else {
      // Auto-login as guest — no signup needed
      api.post('/auth/guest').then(res => {
        const { token: t, user: u } = res.data
        setToken(t)
        setUser(u)
        localStorage.setItem('token', t)
        localStorage.setItem('user', JSON.stringify(u))
      }).catch(console.error).finally(() => setIsReady(true))
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
