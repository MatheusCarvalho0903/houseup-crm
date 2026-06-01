'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import type { Lead, EtapaLead } from '@/lib/types'
import { KANBAN_ETAPAS, etapaLabels } from '@/lib/lead-utils'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

export function KanbanBoard() {
  const { profile } = useUser()
  const canEdit = profile?.role === 'socio' || profile?.role === 'gestor_comercial'

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null)
  const [perdidoOpen, setPerdidoOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const fetchLeads = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('leads')
      .select('*, responsavel:users_profiles!responsavel_id(full_name, role)')
      .order('last_activity_at', { ascending: false })
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id)
    setDraggingLead(lead ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggingLead(null)
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const newEtapa = over.id as EtapaLead
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.etapa === newEtapa) return

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, etapa: newEtapa } : l))
    )

    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('leads')
      .update({ etapa: newEtapa, updated_at: now, last_activity_at: now })
      .eq('id', leadId)

    if (error) {
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, etapa: lead.etapa } : l))
      )
    }
  }

  const perdidoLeads = leads.filter((l) => l.etapa === 'perdido')
  const totalLeads = leads.filter((l) => l.etapa !== 'perdido').length

  if (loading) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Pipeline</h1>
        <div className="p-12 text-center text-gray-400 text-sm">Carregando pipeline...</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Pipeline</h1>
        <p className="text-sm text-gray-500">
          {totalLeads} lead{totalLeads !== 1 ? 's' : ''} ativos
        </p>
      </div>

      {!canEdit && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm">
          Você está no modo somente leitura. Apenas sócios e gestores comerciais podem mover leads.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Kanban columns — horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-4 -mx-1 px-1">
          <div className="flex gap-4 min-w-max">
            {KANBAN_ETAPAS.map((etapa) => (
              <KanbanColumn
                key={etapa}
                etapa={etapa}
                leads={leads.filter((l) => l.etapa === etapa)}
                canDrag={canEdit}
              />
            ))}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {draggingLead ? (
            <div className="bg-white rounded-xl border-2 border-[#1B2B4B]/30 p-3.5 shadow-2xl w-[272px] opacity-95 rotate-2">
              <p className="font-semibold text-sm text-[#1B2B4B] truncate">
                {draggingLead.name}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Perdidos — collapsible section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setPerdidoOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="font-semibold text-sm text-[#1B2B4B]">
              {etapaLabels.perdido}
            </span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {perdidoLeads.length}
            </span>
          </div>
          {perdidoOpen ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
        </button>

        {perdidoOpen && (
          <div className="px-5 pb-5">
            {perdidoLeads.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhum lead perdido.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {perdidoLeads.map((lead) => (
                  <KanbanCard key={lead.id} lead={lead} canDrag={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
