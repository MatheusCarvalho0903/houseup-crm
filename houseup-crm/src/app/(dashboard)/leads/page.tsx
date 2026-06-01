import { createClient } from '@/lib/supabase/server'
import { LeadsClient } from '@/components/leads/LeadsClient'
import type { Lead } from '@/lib/types'

export default async function LeadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const canEdit =
    profile?.role === 'socio' || profile?.role === 'gestor_comercial'

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, responsavel:users_profiles!responsavel_id(full_name, role)')
    .order('last_activity_at', { ascending: false })

  if (error) console.error('Erro ao buscar leads:', error)

  return (
    <LeadsClient
      initialLeads={(leads as Lead[]) ?? []}
      canEdit={canEdit}
    />
  )
}
