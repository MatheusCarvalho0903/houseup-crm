'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  CheckCircle,
  Target,
  AtSign,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import type { EtapaLead, Origem, TipoInteresse } from '@/lib/types'
import { etapaColors, origemColors } from '@/lib/lead-utils'
import { cn } from '@/lib/utils'

// ── Label maps ────────────────────────────────────────────────────────────────

const etapaFunilLabels: Record<EtapaLead, string> = {
  novo_lead: 'Novo Lead',
  qualificacao: 'Qualificação',
  reuniao_briefing: 'Reunião',
  proposta_enviada: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

const etapaBarColors: Record<EtapaLead, string> = {
  novo_lead: 'bg-slate-400',
  qualificacao: 'bg-purple-500',
  reuniao_briefing: 'bg-blue-500',
  proposta_enviada: 'bg-yellow-500',
  negociacao: 'bg-orange-500',
  fechado: 'bg-green-600',
  perdido: 'bg-red-500',
}

const origemBadgeLabels: Record<Origem, string> = {
  instagram_organico: 'Instagram Orgânico',
  trafego_pago: 'Tráfego Pago',
  indicacao: 'Indicação',
}

const tipoInteresseLabels: Record<TipoInteresse, string> = {
  so_projeto: 'Só Projeto',
  so_obra: 'Só Obra',
  projeto_e_obra: 'Projeto + Obra',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  total: number
  emAndamento: number
  fechados: number
  taxaConversao: string
  byEtapa: Array<{ etapa: EtapaLead; count: number }>
  byOrigem: Array<{ origem: Origem; count: number; pct: number }>
  staleLeads: Array<{ id: string; name: string; etapa: EtapaLead; diasParado: number }>
  leadsRecentes: Array<{
    id: string
    name: string
    origem: Origem | null
    tipo_interesse: TipoInteresse | null
    etapa: EtapaLead
    created_at: string
  }>
  motivosPerda: Array<{ motivo: string; count: number }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateMed(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardClient({
  total,
  emAndamento,
  fechados,
  taxaConversao,
  byEtapa,
  byOrigem,
  staleLeads,
  leadsRecentes,
  motivosPerda,
}: Props) {
  const [hoje, setHoje] = useState('')

  useEffect(() => {
    setHoje(
      new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date())
    )
  }, [])

  const maxEtapaCount = Math.max(...byEtapa.map((e) => e.count), 1)
  const maxOrigemCount = Math.max(...byOrigem.map((o) => o.count), 1)

  const hasPerdidos = motivosPerda.length > 0

  return (
    <div className="space-y-6">
      {/* ── Título ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Dashboard</h1>
        {hoje && (
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{hoje}</p>
        )}
      </div>

      {/* ── Seção 1 — Métricas ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total de Leads"
          value={String(total)}
          icon={<Users size={20} />}
          iconClass="bg-[#1B2B4B]/10 text-[#1B2B4B]"
        />
        <MetricCard
          label="Em Andamento"
          value={String(emAndamento)}
          icon={<TrendingUp size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Fechados"
          value={String(fechados)}
          icon={<CheckCircle size={20} />}
          iconClass="bg-green-50 text-green-600"
        />
        <MetricCard
          label="Taxa de Conversão"
          value={taxaConversao}
          icon={<Target size={20} />}
          iconClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* ── Seção 2 — Funil + Origem ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funil */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Leads por Etapa
          </h2>
          <div className="space-y-3">
            {byEtapa.map(({ etapa, count }) => (
              <div key={etapa} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 shrink-0 truncate">
                  {etapaFunilLabels[etapa]}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn('h-2.5 rounded-full transition-all', etapaBarColors[etapa])}
                    style={{ width: `${(count / maxEtapaCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-5 text-right shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
          {total === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum lead cadastrado.
            </p>
          )}
        </div>

        {/* Origem */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Origem dos Leads
          </h2>
          <div className="space-y-4">
            {byOrigem.map(({ origem, count, pct }) => (
              <div key={origem}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <OrigemIcon origem={origem} />
                    <span className="text-sm text-gray-700">
                      {origemBadgeLabels[origem]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {count}
                    </span>
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-1.5 rounded-full',
                      origem === 'instagram_organico' && 'bg-green-500',
                      origem === 'trafego_pago' && 'bg-blue-500',
                      origem === 'indicacao' && 'bg-orange-500'
                    )}
                    style={{ width: `${(count / maxOrigemCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {total === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum lead cadastrado.
            </p>
          )}
        </div>
      </div>

      {/* ── Seção 3 — Alertas de leads parados ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {staleLeads.length === 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">
                Todos os leads estão ativos
              </p>
              <p className="text-xs text-gray-400">
                Nenhum lead sem movimentação nos últimos 4 dias.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-700">
                Leads sem movimentação
              </h2>
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {staleLeads.length}
              </span>
            </div>
            <div className="space-y-2">
              {staleLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-red-50/60 border border-red-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <Clock size={13} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {lead.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            etapaColors[lead.etapa]
                          )}
                        >
                          {etapaFunilLabels[lead.etapa]}
                        </span>
                        <span className="text-xs text-red-600 font-medium">
                          {lead.diasParado} dias sem movimentação
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="shrink-0 text-xs font-semibold text-[#1B2B4B] hover:underline px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-[#1B2B4B]/30 transition-colors"
                  >
                    Ver Lead
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Seção 4 — Leads recentes ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Leads Recentes</h2>
        </div>
        {leadsRecentes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            Nenhum lead cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                    Nome
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                    Origem
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                    Interesse
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                    Etapa
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                    Cadastrado em
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leadsRecentes.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-5 py-3.5">
                      {lead.origem ? (
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                            origemColors[lead.origem]
                          )}
                        >
                          {origemBadgeLabels[lead.origem]}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {lead.tipo_interesse
                        ? tipoInteresseLabels[lead.tipo_interesse]
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                          etapaColors[lead.etapa]
                        )}
                      >
                        {etapaFunilLabels[lead.etapa]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDateMed(lead.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-xs font-semibold text-[#1B2B4B] hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Seção 5 — Motivos de perda ──────────────────────────────────────── */}
      {hasPerdidos && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Motivos de Perda
          </h2>
          <div className="flex flex-wrap gap-2">
            {motivosPerda.map(({ motivo, count }) => (
              <div
                key={motivo}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl"
              >
                <span className="text-sm text-red-700 font-medium">{motivo}</span>
                <span className="text-xs font-bold bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconClass: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
          <p className="text-3xl font-bold text-[#1B2B4B] leading-none">{value}</p>
        </div>
        <div className={cn('p-2.5 rounded-xl shrink-0', iconClass)}>{icon}</div>
      </div>
    </div>
  )
}

function OrigemIcon({ origem }: { origem: Origem }) {
  const base = 'p-1.5 rounded-lg shrink-0'
  if (origem === 'instagram_organico')
    return (
      <span className={cn(base, 'bg-green-100 text-green-600')}>
        <AtSign size={14} />
      </span>
    )
  if (origem === 'trafego_pago')
    return (
      <span className={cn(base, 'bg-blue-100 text-blue-600')}>
        <TrendingUp size={14} />
      </span>
    )
  return (
    <span className={cn(base, 'bg-orange-100 text-orange-600')}>
      <Users size={14} />
    </span>
  )
}
