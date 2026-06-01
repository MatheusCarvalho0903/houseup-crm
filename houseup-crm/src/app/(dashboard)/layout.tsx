import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layout/DashboardShell'
import type { UserProfile } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <DashboardShell
      profile={(profile as UserProfile) ?? null}
      userEmail={user!.email ?? null}
    >
      {children}
    </DashboardShell>
  )
}
