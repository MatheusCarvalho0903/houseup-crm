'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Origem, TipoInteresse } from '@/lib/types'
import { origemLabels, tipoInteresseLabels } from '@/lib/lead-utils'
import { cn } from '@/lib/utils'

interface Props {
  onClose: () => void
  onCreated: () => void
}

interface FormState {
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

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0',
          value ? 'bg-[#1B2B4B]' : 'bg-gray-300'
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

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/20 focus:border-[#1B2B4B] bg-white'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export function LeadFormModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
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

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Nome e telefone são obrigatórios.')
      return
    }
    setLoading(true)
    setError('')

    console.log('1. Iniciando salvamento...')
    console.log('2. Dados do formulário:', form)

    try {
      console.log('3. Criando cliente Supabase...')
      const supabase = createClient()
      console.log('4. Cliente criado, executando insert...')

      const { data: { user } } = await supabase.auth.getUser()
      console.log('Usuario atual:', user?.id)

      const insertData = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        instagram: form.instagram.trim() || null,
        origem: form.origem || null,
        campanha: form.origem === 'trafego_pago' ? (form.campanha.trim() || null) : null,
        tem_terreno: form.tem_terreno ?? false,
        localizacao_terreno: form.tem_terreno ? (form.localizacao_terreno.trim() || null) : null,
        tem_projeto: form.tem_projeto ?? false,
        precisa_financiamento: form.precisa_financiamento ?? false,
        orcamento_desejado: form.orcamento_desejado ? parseFloat(form.orcamento_desejado) : null,
        tipo_interesse: form.tipo_interesse || null,
        notas: form.notas.trim() || null,
        etapa: 'novo_lead',
        responsavel_id: user?.id || null,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Dados para insert:', insertData)

      const { data, error: dbError } = await supabase
        .from('leads')
        .insert(insertData)
        .select()
        .single()

      console.log('Resultado insert:', { data, error: dbError })

      if (dbError) {
        console.error('ERRO ao salvar:', dbError)
        setError('Erro ao criar lead. Verifique os dados e tente novamente.')
        return
      }

      onCreated()
    } catch (err) {
      console.error('Catch error:', err)
      setError('Erro inesperado ao criar lead.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#1B2B4B]">Novo Lead</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Nome completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputCls}
              placeholder="Nome do cliente"
            />
          </div>

          {/* Phone + Instagram */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Telefone *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className={inputCls}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => set('instagram', e.target.value)}
                className={inputCls}
                placeholder="@usuario"
              />
            </div>
          </div>

          {/* Origem + conditional Campanha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Origem</label>
              <select
                value={form.origem}
                onChange={(e) => set('origem', e.target.value as Origem | '')}
                className={inputCls}
              >
                <option value="">Selecionar...</option>
                {(Object.entries(origemLabels) as [Origem, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de interesse</label>
              <select
                value={form.tipo_interesse}
                onChange={(e) => set('tipo_interesse', e.target.value as TipoInteresse | '')}
                className={inputCls}
              >
                <option value="">Selecionar...</option>
                {(Object.entries(tipoInteresseLabels) as [TipoInteresse, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {form.origem === 'trafego_pago' && (
            <div>
              <label className={labelCls}>Campanha</label>
              <input
                type="text"
                value={form.campanha}
                onChange={(e) => set('campanha', e.target.value)}
                className={inputCls}
                placeholder="Nome da campanha"
              />
            </div>
          )}

          {/* Orcamento */}
          <div>
            <label className={labelCls}>Orçamento desejado (R$)</label>
            <input
              type="number"
              value={form.orcamento_desejado}
              onChange={(e) => set('orcamento_desejado', e.target.value)}
              className={inputCls}
              placeholder="0,00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Toggles */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <Toggle
              label="Tem terreno?"
              value={form.tem_terreno}
              onChange={(v) => set('tem_terreno', v)}
            />
            {form.tem_terreno && (
              <div className="pt-1">
                <label className={labelCls}>Localização do terreno</label>
                <input
                  type="text"
                  value={form.localizacao_terreno}
                  onChange={(e) => set('localizacao_terreno', e.target.value)}
                  className={inputCls}
                  placeholder="Cidade, bairro..."
                />
              </div>
            )}
            <Toggle label="Tem projeto?" value={form.tem_projeto} onChange={(v) => set('tem_projeto', v)} />
            <Toggle
              label="Precisa de financiamento?"
              value={form.precisa_financiamento}
              onChange={(v) => set('precisa_financiamento', v)}
            />
          </div>

          {/* Notas */}
          <div>
            <label className={labelCls}>Notas iniciais</label>
            <textarea
              value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
              className={cn(inputCls, 'resize-none')}
              rows={3}
              placeholder="Observações sobre o lead..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium hover:bg-[#243a63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
