'use client'

import { useDroppable } from '@dnd-kit/core'
import type { Lead, EtapaLead } from '@/lib/types'
import { etapaLabels, etapaColumnColors } from '@/lib/lead-utils'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/lib/utils'

interface Props {
  etapa: EtapaLead
  leads: Lead[]
  canDrag: boolean
}

export function KanbanColumn({ etapa, leads, canDrag }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })

  return (
    <div className="flex-shrink-0 w-[272px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full shrink-0',
              etapaColumnColors[etapa] ?? 'bg-gray-400'
            )}
          />
          <h3 className="font-semibold text-sm text-[#1B2B4B] leading-tight">
            {etapaLabels[etapa]}
          </h3>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[120px] space-y-2 rounded-xl p-2 transition-colors duration-150',
          isOver
            ? 'bg-[#1B2B4B]/8 ring-2 ring-[#1B2B4B]/25'
            : 'bg-gray-50/70'
        )}
      >
        {leads.length === 0 && (
          <div
            className={cn(
              'flex items-center justify-center h-20 rounded-lg border-2 border-dashed text-xs transition-colors',
              isOver
                ? 'border-[#1B2B4B]/40 text-[#1B2B4B]'
                : 'border-gray-200 text-gray-400'
            )}
          >
            {isOver ? 'Soltar aqui' : 'Sem leads'}
          </div>
        )}
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} canDrag={canDrag} />
        ))}
      </div>
    </div>
  )
}
