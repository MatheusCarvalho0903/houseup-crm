import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginClient } from '@/components/auth/LoginClient'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LoginClient />
}
