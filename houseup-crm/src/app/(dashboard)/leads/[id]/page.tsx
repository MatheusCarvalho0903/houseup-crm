import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeadDetailClient } from '@/components/leads/LeadDetailClient'
import type { Lead, Interacao } from '@/lib/types'

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: lead } = await supabase
    .from('leads')
    .select('*, responsavel:users_profiles!responsavel_id(full_name, role)')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const { data: interacoes } = await supabase
    .from('interacoes')
    .select('*, usuario:users_profiles(full_name)')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  return (
    <LeadDetailClient
      initialLead={lead as Lead}
      initialInteractions={(interacoes as Interacao[]) ?? []}
      canEdit={canEdit}
      userId={user!.id}
    />
  )
}
