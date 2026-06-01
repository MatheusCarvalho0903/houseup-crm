import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import type { Lead, EtapaLead, Origem } from '@/lib/types'
import { daysSince } from '@/lib/lead-utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const all = (leads as Lead[]) ?? []

  // ── Métricas ────────────────────────────────────────────────────────────────
  const total = all.length
  const fechados = all.filter((l) => l.etapa === 'fechado').length
  const emAndamento = all.filter(
    (l) => l.etapa !== 'fechado' && l.etapa !== 'perdido'
  ).length
  const taxaConversao =
    total > 0 ? `${((fechados / total) * 100).toFixed(1)}%` : '0%'

  // ── Por etapa ────────────────────────────────────────────────────────────────
  const etapasOrdem: EtapaLead[] = [
    'novo_lead',
    'qualificacao',
    'reuniao_briefing',
    'proposta_enviada',
    'negociacao',
    'fechado',
    'perdido',
  ]
  const byEtapa = etapasOrdem.map((etapa) => ({
    etapa,
    count: all.filter((l) => l.etapa === etapa).length,
  }))

  // ── Por origem ───────────────────────────────────────────────────────────────
  const origens: Origem[] = ['instagram_organico', 'trafego_pago', 'indicacao']
  const byOrigem = origens.map((origem) => {
    const count = all.filter((l) => l.origem === origem).length
    return {
      origem,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })

  // ── Leads parados (ativos, sem movimentação > 4 dias) ────────────────────────
  const staleLeads = all
    .filter((l) => l.etapa !== 'perdido' && l.etapa !== 'fechado')
    .map((l) => ({
      id: l.id,
      name: l.name,
      etapa: l.etapa,
      diasParado: daysSince(l.last_activity_at ?? l.created_at),
    }))
    .filter((l) => l.diasParado > 4)
    .sort((a, b) => b.diasParado - a.diasParado)

  // ── Leads recentes (últimos 5) ───────────────────────────────────────────────
  const leadsRecentes = all.slice(0, 5).map((l) => ({
    id: l.id,
    name: l.name,
    origem: l.origem,
    tipo_interesse: l.tipo_interesse,
    etapa: l.etapa,
    created_at: l.created_at,
  }))

  // ── Motivos de perda ─────────────────────────────────────────────────────────
  const motivoMap = new Map<string, number>()
  all
    .filter((l) => l.etapa === 'perdido' && l.motivo_perda?.trim())
    .forEach((l) => {
      const m = l.motivo_perda!.trim()
      motivoMap.set(m, (motivoMap.get(m) ?? 0) + 1)
    })
  const motivosPerda = Array.from(motivoMap.entries())
    .map(([motivo, count]) => ({ motivo, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <DashboardClient
      total={total}
      emAndamento={emAndamento}
      fechados={fechados}
      taxaConversao={taxaConversao}
      byEtapa={byEtapa}
      byOrigem={byOrigem}
      staleLeads={staleLeads}
      leadsRecentes={leadsRecentes}
      motivosPerda={motivosPerda}
    />
  )
}
