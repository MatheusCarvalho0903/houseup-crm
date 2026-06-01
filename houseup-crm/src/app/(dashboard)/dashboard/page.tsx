import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import type { EtapaLead } from '@/lib/types'
import { etapaLabels, etapaColors } from '@/lib/lead-utils'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('id, etapa, last_activity_at, created_at')

  const all = leads ?? []

  const total = all.length
  const ativos = all.filter(
    (l) => l.etapa !== 'perdido' && l.etapa !== 'fechado'
  ).length
  const fechados = all.filter((l) => l.etapa === 'fechado').length
  const perdidos = all.filter((l) => l.etapa === 'perdido').length

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 4)
  const isoDate = cutoff.toISOString()
  const stale = all.filter(
    (l) =>
      l.etapa !== 'perdido' &&
      l.etapa !== 'fechado' &&
      l.last_activity_at < isoDate
  ).length

  const etapaOrder: EtapaLead[] = [
    'novo_lead',
    'qualificacao',
    'reuniao_briefing',
    'proposta_enviada',
    'negociacao',
    'fechado',
  ]
  const countByEtapa = etapaOrder.map((etapa) => ({
    etapa,
    count: all.filter((l) => l.etapa === etapa).length,
  }))

  const stats = [
    {
      label: 'Total de leads',
      value: total,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Leads ativos',
      value: ativos,
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Fechados',
      value: fechados,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Sem atividade +4d',
      value: stale,
      icon: AlertCircle,
      color: stale > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2B4B]">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
          >
            <div className={cn('p-2.5 rounded-xl shrink-0', color)}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B2B4B] leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leads por etapa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads por etapa</h2>
        <div className="space-y-2.5">
          {countByEtapa.map(({ etapa, count }) => (
            <div key={etapa} className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    etapaColors[etapa]
                  )}
                >
                  {etapaLabels[etapa]}
                </span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#1B2B4B] h-2 rounded-full transition-all"
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 w-6 text-right shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>

        {total === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum lead cadastrado ainda.
          </p>
        )}

        {perdidos > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            + {perdidos} lead{perdidos !== 1 ? 's' : ''} perdido{perdidos !== 1 ? 's' : ''} (não exibido acima)
          </p>
        )}
      </div>
    </div>
  )
}
