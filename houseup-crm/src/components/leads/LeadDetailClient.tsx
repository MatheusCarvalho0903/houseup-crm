'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Phone,
  AtSign,
  MapPin,
  MessageCircle,
  Mail,
  Calendar,
  FileText,
  Plus,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import type { Lead, Interacao, EtapaLead, TipoInteracao, Origem, TipoInteresse } from '@/lib/types'
import {
  etapaLabels,
  origemLabels,
  tipoInteresseLabels,
  tipoInteracaoLabels,
  etapaColors,
  origemColors,
  isStale,
  daysSince,
  formatDate,
  formatCurrency,
} from '@/lib/lead-utils'
import { cn } from '@/lib/utils'

// ─── Icons per interaction type ───────────────────────────────────────────────
const interacaoIcons: Record<TipoInteracao, React.ReactNode> = {
  ligacao: <Phone size={14} />,
  whatsapp: <MessageCircle size={14} />,
  email: <Mail size={14} />,
  reuniao: <Calendar size={14} />,
  nota: <FileText size={14} />,
}

// ─── Shared style helpers ──────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/20 focus:border-[#1B2B4B] bg-white disabled:bg-gray-50 disabled:text-gray-500'
const labelCls = 'block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide'

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0',
          value ? 'bg-[#1B2B4B]' : 'bg-gray-300',
          disabled && 'cursor-default opacity-60'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200',
            value ? 'left-[calc(100%-22px)]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  )
}

// ─── Edit form state type ─────────────────────────────────────────────────────
interface EditForm {
  name: string
  phone: string
  instagram: string
  origem: Origem | ''
  campanha: string
  tem_terreno: boolean
  localizacao_terreno: string
  tem_projeto: boolean
  precisa_financiamento: boolean
  orcamento_desejado: string
  tipo_interesse: TipoInteresse | ''
  notas: string
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LeadDetailClient({ leadId }: { leadId: string }) {
  const { user, profile } = useUser()
  const canEdit = profile?.role === 'socio' || profile?.role === 'gestor_comercial'

  const [lead, setLead] = useState<Lead | null>(null)
  const [interactions, setInteractions] = useState<Interacao[]>([])
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    phone: '',
    instagram: '',
    origem: '',
    campanha: '',
    tem_terreno: false,
    localizacao_terreno: '',
    tem_projeto: false,
    precisa_financiamento: false,
    orcamento_desejado: '',
    tipo_interesse: '',
    notas: '',
  })

  // Stage change state
  const [etapaDraft, setEtapaDraft] = useState<EtapaLead>('novo_lead')
  const [motivoPerda, setMotivoPerda] = useState('')
  const [savingEtapa, setSavingEtapa] = useState(false)

  // Interaction form state
  const [interForm, setInterForm] = useState<{ tipo: TipoInteracao; descricao: string }>({
    tipo: 'ligacao',
    descricao: '',
  })
  const [savingInter, setSavingInter] = useState(false)

  useEffect(() => { fetchAll() }, [leadId])

  const fetchAll = async () => {
    const supabase = createClient()
    const [leadRes, interRes] = await Promise.all([
      supabase
        .from('leads')
        .select('*, responsavel:users_profiles!responsavel_id(full_name, role)')
        .eq('id', leadId)
        .single(),
      supabase
        .from('interacoes')
        .select('*, usuario:users_profiles!user_id(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
    ])
    if (leadRes.data) {
      const l = leadRes.data as Lead
      setLead(l)
      setEtapaDraft(l.etapa)
      setMotivoPerda(l.motivo_perda ?? '')
    }
    setInteractions((interRes.data as Interacao[]) ?? [])
    setLoading(false)
  }

  const startEditing = () => {
    if (!lead) return
    setEditForm({
      name: lead.name,
      phone: lead.phone ?? '',
      instagram: lead.instagram ?? '',
      origem: lead.origem ?? '',
      campanha: lead.campanha ?? '',
      tem_terreno: lead.tem_terreno,
      localizacao_terreno: lead.localizacao_terreno ?? '',
      tem_projeto: lead.tem_projeto,
      precisa_financiamento: lead.precisa_financiamento,
      orcamento_desejado: lead.orcamento_desejado?.toString() ?? '',
      tipo_interesse: lead.tipo_interesse ?? '',
      notas: lead.notas ?? '',
    })
    setEditing(true)
  }

  const saveEdits = async () => {
    if (!lead) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('leads')
      .update({
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
        instagram: editForm.instagram.trim() || null,
        origem: editForm.origem || null,
        campanha: editForm.origem === 'trafego_pago' ? (editForm.campanha.trim() || null) : null,
        tem_terreno: editForm.tem_terreno,
        localizacao_terreno: editForm.tem_terreno ? (editForm.localizacao_terreno.trim() || null) : null,
        tem_projeto: editForm.tem_projeto,
        precisa_financiamento: editForm.precisa_financiamento,
        orcamento_desejado: editForm.orcamento_desejado ? parseFloat(editForm.orcamento_desejado) : null,
        tipo_interesse: editForm.tipo_interesse || null,
        notas: editForm.notas.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)
      .select('*, responsavel:users_profiles!responsavel_id(full_name, role)')
      .single()

    if (data) setLead(data as Lead)
    setSaving(false)
    setEditing(false)
  }

  const saveEtapa = async () => {
    if (!lead || etapaDraft === lead.etapa) return
    if (etapaDraft === 'perdido' && !motivoPerda.trim()) return
    setSavingEtapa(true)
    const supabase = createClient()
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('leads')
      .update({
        etapa: etapaDraft,
        motivo_perda: etapaDraft === 'perdido' ? motivoPerda.trim() : null,
        updated_at: now,
        last_activity_at: now,
      })
      .eq('id', lead.id)
      .select('*, responsavel:users_profiles!responsavel_id(full_name, role)')
      .single()
    if (data) setLead(data as Lead)
    setSavingEtapa(false)
  }

  const addInteraction = async () => {
    if (!lead || !user || !interForm.descricao.trim()) return
    setSavingInter(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data: interData } = await supabase
      .from('interacoes')
      .insert({ lead_id: lead.id, user_id: user.id, tipo: interForm.tipo, descricao: interForm.descricao.trim() })
      .select('*, usuario:users_profiles!user_id(full_name)')
      .single()

    await supabase
      .from('leads')
      .update({ last_activity_at: now, updated_at: now })
      .eq('id', lead.id)

    if (interData) {
      setInteractions((prev) => [interData as Interacao, ...prev])
      setLead((prev) => (prev ? { ...prev, last_activity_at: now } : prev))
    }
    setInterForm({ tipo: 'ligacao', descricao: '' })
    setSavingInter(false)
  }

  // ─── Loading / not found states ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500 text-sm">Lead não encontrado.</p>
        <Link href="/leads" className="text-[#1B2B4B] text-sm font-medium hover:underline">
          ← Voltar para Leads
        </Link>
      </div>
    )
  }

  const stale = isStale(lead.last_activity_at)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-6xl">
      {/* Back + title */}
      <div className="flex items-start gap-3">
        <Link
          href="/leads"
          className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft size={18} className="text-[#1B2B4B]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#1B2B4B] truncate">{lead.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', etapaColors[lead.etapa])}>
              {etapaLabels[lead.etapa]}
            </span>
            {stale && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <Clock size={12} />
                Parado há {daysSince(lead.last_activity_at)} dias
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── LEFT COLUMN ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Lead data card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#1B2B4B]">Dados do Lead</h2>
              {canEdit && !editing && (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 text-sm text-[#1B2B4B] hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Edit2 size={14} /> Editar
                </button>
              )}
              {editing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button
                    onClick={saveEdits}
                    disabled={saving}
                    className="flex items-center gap-1 text-sm bg-[#1B2B4B] text-white hover:bg-[#243a63] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={labelCls}>Nome</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{lead.name}</p>
                )}
              </div>

              {/* Phone + Instagram */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Telefone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      className={inputCls}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      {lead.phone ?? '—'}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Instagram</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))}
                      className={inputCls}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 flex items-center gap-1.5">
                      <AtSign size={13} className="text-gray-400 shrink-0" />
                      {lead.instagram ?? '—'}
                    </p>
                  )}
                </div>
              </div>

              {/* Origem + Tipo de interesse */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Origem</label>
                  {editing ? (
                    <select
                      value={editForm.origem}
                      onChange={(e) => setEditForm((f) => ({ ...f, origem: e.target.value as Origem | '' }))}
                      className={inputCls}
                    >
                      <option value="">Selecionar...</option>
                      {(Object.entries(origemLabels) as [Origem, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  ) : lead.origem ? (
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', origemColors[lead.origem])}>
                      {origemLabels[lead.origem]}
                    </span>
                  ) : (
                    <p className="text-sm text-gray-400">—</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Tipo de interesse</label>
                  {editing ? (
                    <select
                      value={editForm.tipo_interesse}
                      onChange={(e) => setEditForm((f) => ({ ...f, tipo_interesse: e.target.value as TipoInteresse | '' }))}
                      className={inputCls}
                    >
                      <option value="">Selecionar...</option>
                      {(Object.entries(tipoInteresseLabels) as [TipoInteresse, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {lead.tipo_interesse ? tipoInteresseLabels[lead.tipo_interesse] : '—'}
                    </p>
                  )}
                </div>
              </div>

              {/* Campanha (conditional) */}
              {(editing ? editForm.origem === 'trafego_pago' : !!lead.campanha) && (
                <div>
                  <label className={labelCls}>Campanha</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.campanha}
                      onChange={(e) => setEditForm((f) => ({ ...f, campanha: e.target.value }))}
                      className={inputCls}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{lead.campanha}</p>
                  )}
                </div>
              )}

              {/* Orcamento */}
              <div>
                <label className={labelCls}>Orçamento desejado</label>
                {editing ? (
                  <input
                    type="number"
                    value={editForm.orcamento_desejado}
                    onChange={(e) => setEditForm((f) => ({ ...f, orcamento_desejado: e.target.value }))}
                    className={inputCls}
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <p className="text-sm text-gray-700">
                    {lead.orcamento_desejado ? formatCurrency(lead.orcamento_desejado) : '—'}
                  </p>
                )}
              </div>

              {/* Toggles */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <Toggle
                  label="Tem terreno?"
                  value={editing ? editForm.tem_terreno : lead.tem_terreno}
                  onChange={(v) => setEditForm((f) => ({ ...f, tem_terreno: v }))}
                  disabled={!editing}
                />
                {(editing ? editForm.tem_terreno : lead.tem_terreno) && (
                  <div className="pt-1">
                    <label className={labelCls}>Localização do terreno</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.localizacao_terreno}
                        onChange={(e) => setEditForm((f) => ({ ...f, localizacao_terreno: e.target.value }))}
                        className={inputCls}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 flex items-center gap-1.5 mt-1">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        {lead.localizacao_terreno ?? '—'}
                      </p>
                    )}
                  </div>
                )}
                <Toggle
                  label="Tem projeto?"
                  value={editing ? editForm.tem_projeto : lead.tem_projeto}
                  onChange={(v) => setEditForm((f) => ({ ...f, tem_projeto: v }))}
                  disabled={!editing}
                />
                <Toggle
                  label="Precisa de financiamento?"
                  value={editing ? editForm.precisa_financiamento : lead.precisa_financiamento}
                  onChange={(v) => setEditForm((f) => ({ ...f, precisa_financiamento: v }))}
                  disabled={!editing}
                />
              </div>

              {/* Responsavel */}
              <div>
                <label className={labelCls}>Responsável</label>
                <p className="text-sm text-gray-700">{lead.responsavel?.full_name ?? '—'}</p>
              </div>

              {/* Notas */}
              <div>
                <label className={labelCls}>Notas</label>
                {editing ? (
                  <textarea
                    value={editForm.notas}
                    onChange={(e) => setEditForm((f) => ({ ...f, notas: e.target.value }))}
                    className={cn(inputCls, 'resize-none')}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {lead.notas || <span className="text-gray-400">—</span>}
                  </p>
                )}
              </div>

              {/* motivo perda (view only) */}
              {lead.etapa === 'perdido' && lead.motivo_perda && !editing && (
                <div>
                  <label className={labelCls}>Motivo da perda</label>
                  <p className="text-sm text-red-600 whitespace-pre-wrap">{lead.motivo_perda}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stage change card */}
          {canEdit && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-[#1B2B4B] mb-4">Alterar Etapa</h2>
              <div className="space-y-3">
                <select
                  value={etapaDraft}
                  onChange={(e) => setEtapaDraft(e.target.value as EtapaLead)}
                  className={inputCls}
                >
                  {(Object.entries(etapaLabels) as [EtapaLead, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>

                {etapaDraft === 'perdido' && (
                  <div>
                    <label className={labelCls}>Motivo da perda *</label>
                    <textarea
                      value={motivoPerda}
                      onChange={(e) => setMotivoPerda(e.target.value)}
                      className={cn(inputCls, 'resize-none')}
                      rows={2}
                      placeholder="Descreva o motivo da perda..."
                    />
                  </div>
                )}

                <button
                  onClick={saveEtapa}
                  disabled={
                    savingEtapa ||
                    etapaDraft === lead.etapa ||
                    (etapaDraft === 'perdido' && !motivoPerda.trim())
                  }
                  className="w-full py-2.5 bg-[#1B2B4B] text-white rounded-lg text-sm font-semibold hover:bg-[#243a63] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {savingEtapa ? 'Salvando...' : 'Confirmar mudança de etapa'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Add interaction card */}
          {canEdit && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-[#1B2B4B] mb-4">Registrar Interação</h2>
              <div className="space-y-3">
                <select
                  value={interForm.tipo}
                  onChange={(e) => setInterForm((f) => ({ ...f, tipo: e.target.value as TipoInteracao }))}
                  className={inputCls}
                >
                  {(Object.entries(tipoInteracaoLabels) as [TipoInteracao, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <textarea
                  value={interForm.descricao}
                  onChange={(e) => setInterForm((f) => ({ ...f, descricao: e.target.value }))}
                  className={cn(inputCls, 'resize-none')}
                  rows={3}
                  placeholder="Descreva a interação..."
                />
                <button
                  onClick={addInteraction}
                  disabled={savingInter || !interForm.descricao.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B2B4B] text-white rounded-lg text-sm font-semibold hover:bg-[#243a63] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={15} />
                  {savingInter ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          )}

          {/* Interaction history */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-[#1B2B4B] mb-4">
              Histórico de Interações
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({interactions.length})
              </span>
            </h2>

            {interactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhuma interação registrada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {interactions.map((inter) => (
                  <div
                    key={inter.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-[#1B2B4B]/8 rounded-lg text-[#1B2B4B]">
                          {interacaoIcons[inter.tipo]}
                        </span>
                        <span className="text-sm font-semibold text-[#1B2B4B]">
                          {tipoInteracaoLabels[inter.tipo]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        {formatDate(inter.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {inter.descricao}
                    </p>
                    {inter.usuario && (
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        — {inter.usuario.full_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
