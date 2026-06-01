'use client'

import Link from 'next/link'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Clock } from 'lucide-react'
import type { Lead } from '@/lib/types'
import {
  origemLabels,
  tipoInteresseLabels,
  origemColors,
  daysSince,
  isStale,
} from '@/lib/lead-utils'
import { cn } from '@/lib/utils'

interface Props {
  lead: Lead
  canDrag: boolean
}

export function KanbanCard({ lead, canDrag }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id, disabled: !canDrag })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  const days = daysSince(lead.last_activity_at)
  const stale = isStale(lead.last_activity_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canDrag ? { ...listeners, ...attributes } : {})}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-all duration-200',
        isDragging && 'opacity-40 shadow-lg scale-105',
        canDrag && 'cursor-grab active:cursor-grabbing',
        stale && 'border-l-[3px] border-l-red-400'
      )}
    >
      <Link
        href={`/leads/${lead.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className="block"
      >
        <p className="font-semibold text-sm text-[#1B2B4B] mb-2 truncate leading-tight">
          {lead.name}
        </p>

        <div className="flex flex-wrap gap-1 mb-2.5">
          {lead.origem && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                origemColors[lead.origem]
              )}
            >
              {origemLabels[lead.origem]}
            </span>
          )}
          {lead.tipo_interesse && (
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {tipoInteresseLabels[lead.tipo_interesse]}
            </span>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-1 text-xs',
            stale ? 'text-red-500 font-semibold' : 'text-gray-400'
          )}
        >
          {stale && <Clock size={11} />}
          <span>{days === 0 ? 'Atividade hoje' : `${days}d sem atividade`}</span>
        </div>
      </Link>
    </div>
  )
}
