import type { EtapaLead, Origem, TipoInteresse, TipoInteracao } from './types'

export const etapaLabels: Record<EtapaLead, string> = {
  novo_lead: 'Novo Lead',
  qualificacao: 'Qualificação',
  reuniao_briefing: 'Reunião de Briefing',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

export const origemLabels: Record<Origem, string> = {
  instagram_organico: 'Instagram Orgânico',
  trafego_pago: 'Tráfego Pago',
  indicacao: 'Indicação',
}

export const tipoInteresseLabels: Record<TipoInteresse, string> = {
  so_projeto: 'Só Projeto',
  so_obra: 'Só Obra',
  projeto_e_obra: 'Projeto + Obra',
}

export const tipoInteracaoLabels: Record<TipoInteracao, string> = {
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'Email',
  reuniao: 'Reunião',
  nota: 'Nota',
}

export const origemColors: Record<Origem, string> = {
  instagram_organico: 'bg-green-100 text-green-700',
  trafego_pago: 'bg-blue-100 text-blue-700',
  indicacao: 'bg-orange-100 text-orange-700',
}

export const etapaColors: Record<EtapaLead, string> = {
  novo_lead: 'bg-gray-100 text-gray-600',
  qualificacao: 'bg-purple-100 text-purple-700',
  reuniao_briefing: 'bg-blue-100 text-blue-700',
  proposta_enviada: 'bg-yellow-100 text-yellow-700',
  negociacao: 'bg-orange-100 text-orange-700',
  fechado: 'bg-green-100 text-green-700',
  perdido: 'bg-red-100 text-red-700',
}

export const etapaColumnColors: Record<EtapaLead, string> = {
  novo_lead: 'bg-gray-400',
  qualificacao: 'bg-purple-500',
  reuniao_briefing: 'bg-blue-500',
  proposta_enviada: 'bg-yellow-500',
  negociacao: 'bg-orange-500',
  fechado: 'bg-green-500',
  perdido: 'bg-red-500',
}

export const KANBAN_ETAPAS: EtapaLead[] = [
  'novo_lead',
  'qualificacao',
  'reuniao_briefing',
  'proposta_enviada',
  'negociacao',
  'fechado',
]

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export function isStale(dateStr: string): boolean {
  return daysSince(dateStr) > 4
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
