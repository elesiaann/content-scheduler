import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import api from '../utils/api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me').then(res => {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }).catch(() => {
        logout()
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token: t, user: u } = res.data
      setToken(t)
      setUser(u)
      localStorage.setItem('token', t)
      localStorage.setItem('user', JSON.stringify(u))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/register', { email, username, password })
      const { token: t, user: u } = res.data
      setToken(t)
      setUser(u)
      localStorage.setItem('token', t)
      localStorage.setItem('user', JSON.stringify(u))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
