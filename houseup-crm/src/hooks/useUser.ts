'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  full_name: string
  role: 'socio' | 'gestor_comercial' | 'gestor_trafego'
  created_at: string
}

interface UseUserResult {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data as UserProfile)
      }
      // If profile doesn't exist yet (no row in users_profiles) we leave it as null.
      // The header will fall back to the user's email in that case.
    }

    // onAuthStateChange fires immediately with INITIAL_SESSION, which gives us the
    // cached session without a network round-trip. This covers both the first render
    // and future sign-in / sign-out events in the same browser session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading }
}
