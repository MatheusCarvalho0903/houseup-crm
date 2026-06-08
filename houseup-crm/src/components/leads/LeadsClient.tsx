'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, Clock } from 'lucide-react'
import type { Lead, EtapaLead, Origem, TipoInteresse } from '@/lib/types'
import {
  etapaLabels,
  origemLabels,
  tipoInteresseLabels,
  etapaColors,
  origemColors,
  isStale,
  daysSince,
  formatDateShort,
} from '@/lib/lead-utils'
import { LeadFormModal } from './LeadFormModal'
import { cn } from '@/lib/utils'

interface Props {
  initialLeads: Lead[]
  canEdit: boolean
}

export function LeadsClient({ initialLeads, canEdit }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [filterEtapa, setFilterEtapa] = useState<EtapaLead | ''>('')
  const [filterOrigem, setFilterOrigem] = useState<Origem | ''>('')
  const [filterTipo, setFilterTipo] = useState<TipoInteresse | ''>('')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = useMemo(() => {
    return initialLeads.filter((l) => {
      if (filterEtapa && l.etapa !== filterEtapa) return false
      if (filterOrigem && l.origem !== filterOrigem) return false
      if (filterTipo && l.tipo_interesse !== filterTipo) return false
      if (search) {
        const q = search.toLowerCase()
        const matchName = l.name.toLowerCase().includes(q)
        const matchPhone = (l.phone ?? '').toLowerCase().includes(q)
        if (!matchName && !matchPhone) return false
      }
      return true
    })
  }, [initialLeads, filterEtapa, filterOrigem, filterTipo, search])

  const selectCls =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/20 focus:border-[#1B2B4B] bg-white'

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Leads</h1>
        {canEdit && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#1B2B4B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#243a63] transition-colors"
          >
            <Plus size={16} />
            Novo Lead
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/20 focus:border-[#1B2B4B]"
          />
        </div>

        <select
          value={filterEtapa}
          onChange={(e) => setFilterEtapa(e.target.value as EtapaLead | '')}
          className={selectCls}
        >
          <option value="">Todas as etapas</option>
          {(Object.entries(etapaLabels) as [EtapaLead, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          value={filterOrigem}
          onChange={(e) => setFilterOrigem(e.target.value as Origem | '')}
          className={selectCls}
        >
          <option value="">Todas as origens</option>
          {(Object.entries(origemLabels) as [Origem, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value as TipoInteresse | '')}
          className={selectCls}
        >
          <option value="">Todos os tipos</option>
          {(Object.entries(tipoInteresseLabels) as [TipoInteresse, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {(filterEtapa || filterOrigem || filterTipo || search) && (
          <button
            onClick={() => {
              setFilterEtapa('')
              setFilterOrigem('')
              setFilterTipo('')
              setSearch('')
            }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {search || filterEtapa || filterOrigem || filterTipo
              ? 'Nenhum lead encontrado com esses filtros.'
              : 'Nenhum lead cadastrado ainda.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Nome</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Telefone</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Origem</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Etapa</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Responsável</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                    Última Atividade
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((lead) => {
                  const stale = isStale(lead.last_activity_at)
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-5 py-3.5 text-gray-600">{lead.phone ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        {lead.origem ? (
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium',
                              origemColors[lead.origem]
                            )}
                          >
                            {origemLabels[lead.origem]}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            etapaColors[lead.etapa]
                          )}
                        >
                          {etapaLabels[lead.etapa]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {lead.responsavel?.full_name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {mounted ? (
                          <span
                            className={cn(
                              'flex items-center gap-1.5 text-xs font-medium',
                              stale ? 'text-red-500' : 'text-gray-500'
                            )}
                          >
                            {stale && <Clock size={12} />}
                            {formatDateShort(lead.last_activity_at)}
                            {stale && (
                              <span className="text-red-400">
                                ({daysSince(lead.last_activity_at)}d)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 text-[#1B2B4B] font-semibold text-xs hover:underline"
                        >
                          <Eye size={13} />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
              {filtered.length !== initialLeads.length && ` de ${initialLeads.length} total`}
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <LeadFormModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
