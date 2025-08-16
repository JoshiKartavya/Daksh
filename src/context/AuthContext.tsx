import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type AppUser = {
  id: string
  email: string | null
  created_at?: string
}

type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  signIn: (opts: { email: string; password: string }) => Promise<{ error?: string }>
  signUp: (opts: { email: string; password: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user
      if (isMounted) {
        setUser(
          sessionUser
            ? { id: sessionUser.id, email: sessionUser.email ?? null, created_at: (sessionUser as any).created_at }
            : null
        )
        setLoading(false)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user
      setUser(
        sessionUser
          ? { id: sessionUser.id, email: sessionUser.email ?? null, created_at: (sessionUser as any).created_at }
          : null
      )
    })
    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn: AuthContextValue['signIn'] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signUp: AuthContextValue['signUp'] = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    // insert minimal user profile into a public table `users` if present
    const authUser = data.user
    if (authUser) {
      try {
        await supabase.from('users').upsert({ id: authUser.id, email: authUser.email })
      } catch (_) {
        // ignore if table not set up
      }
    }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


