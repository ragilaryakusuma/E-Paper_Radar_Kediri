'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role?: string
  isSubscribed?: boolean
  subscriptionPlan?: string
  subscriptionEndDate?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, phone: string, password: string) => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAndSetUserData = async (supabaseUser: any) => {
    try {
      // Sync user data to Prisma database
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          phone: supabaseUser.user_metadata?.phone || '',
        }),
      }).catch(err => console.error('Failed to sync user to database:', err))

      // Ambil status langganan dari API check
      const subRes = await fetch(`/api/subscription/check?userId=${supabaseUser.id}`)
      let isSubscribed = false
      let subscriptionPlan = ''
      let subscriptionEndDate = ''
      let role = 'user'

      if (subRes.ok) {
        const subData = await subRes.json()
        role = subData.role || 'user'
        if (subData.hasActiveSubscription) {
          isSubscribed = true
          subscriptionPlan = subData.planName
          subscriptionEndDate = subData.endDate
        }
      }

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        phone: supabaseUser.user_metadata?.phone || '',
        role,
        isSubscribed,
        subscriptionPlan,
        subscriptionEndDate,
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error('Error fetching user metadata:', e)
    }
  }

  // Monitor auth state changes
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchAndSetUserData(session.user)
        } else {
          // Check local storage for demo user
          const stored = localStorage.getItem('user')
          if (stored) {
            const parsedUser = JSON.parse(stored)
            setUser(parsedUser)
            // Sync user data to Prisma database
            fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: parsedUser.id,
                email: parsedUser.email,
                name: parsedUser.name,
                phone: parsedUser.phone,
                role: parsedUser.role,
              }),
            }).catch(err => console.error('Failed to sync stored user:', err))
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to get session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true)
      if (session?.user) {
        await fetchAndSetUserData(session.user)
      } else {
        // Only set to null if not a demo user
        const storedUser = localStorage.getItem('user')
        const isDemo = storedUser && (JSON.parse(storedUser).id === 'demo-user-id' || JSON.parse(storedUser).id === 'admin-user-id')
        if (!isDemo) {
          setUser(null)
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Fallback untuk Demo offline
        if (email === 'demo@radarkediri.id' && password === 'demo123') {
          const demoUser: User = {
            id: 'demo-user-id',
            email: 'demo@radarkediri.id',
            name: 'Demo User',
            phone: '08123456789',
            role: 'user',
            isSubscribed: false,
          }
          // Sync demo user to database
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demoUser),
          }).catch(err => console.error('Failed to sync demo user:', err))

          setUser(demoUser)
          localStorage.setItem('user', JSON.stringify(demoUser))
          return
        }
        
        if (email === 'admin@radarkediri.id' && password === 'admin123') {
          const adminUser: User = {
            id: 'admin-user-id',
            email: 'admin@radarkediri.id',
            name: 'Super Admin',
            phone: '08123456789',
            role: 'admin',
            isSubscribed: true,
          }
          // Sync admin user to database
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser),
          }).catch(err => console.error('Failed to sync admin user:', err))

          setUser(adminUser)
          localStorage.setItem('user', JSON.stringify(adminUser))
          return
        }
        
        throw error
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      })
      
      if (error) {
        // Fallback untuk Demo offline
        if (email.includes('demo')) {
          const demoUser: User = {
            id: 'demo-user-id',
            email,
            name,
            phone,
            isSubscribed: false,
          }
          // Sync demo user to database
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demoUser),
          }).catch(err => console.error('Failed to sync demo user:', err))

          setUser(demoUser)
          localStorage.setItem('user', JSON.stringify(demoUser))
          return
        }
        throw error
      }
    } catch (error) {
      console.error('Register failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('cart-storage')
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
