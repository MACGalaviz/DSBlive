import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

// Only this account may edit data (create/update/delete). The DB enforces it
// via RLS; this constant only controls whether the UI buttons are enabled.
// Must match the owner UID pinned in the RLS policies (supabase-setup.sql).
const OWNER_UID = 'c7f0c7bc-5103-4496-ae1c-6d05ccfa8582'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isOwner = !!user && user.id === OWNER_UID

  return (
    <AuthContext.Provider value={{ user, authLoading, isOwner }}>
      {!authLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
