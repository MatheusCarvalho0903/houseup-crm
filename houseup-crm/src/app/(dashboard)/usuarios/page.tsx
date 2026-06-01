import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { UsuariosClient } from '@/components/usuarios/UsuariosClient'
import type { UserRow } from '@/components/usuarios/UsuariosClient'
import type { UserRole } from '@/lib/types'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'socio') {
    redirect('/dashboard')
  }

  // Busca todos os perfis
  const { data: profiles } = await supabase
    .from('users_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Busca emails via Admin API
  let emailMap = new Map<string, string>()
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      const { data: authData } = await admin.auth.admin.listUsers()
      emailMap = new Map(
        (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
      )
    } catch {
      // Service role key inválida ou ausente — emails ficam em branco
    }
  }

  const usuarios: UserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role as UserRole,
    created_at: p.created_at,
    email: emailMap.get(p.id) ?? null,
  }))

  return <UsuariosClient initialUsers={usuarios} />
}
