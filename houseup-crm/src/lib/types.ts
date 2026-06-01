export type Origem = 'instagram_organico' | 'trafego_pago' | 'indicacao'
export type TipoInteresse = 'so_projeto' | 'so_obra' | 'projeto_e_obra'
export type EtapaLead =
  | 'novo_lead'
  | 'qualificacao'
  | 'reuniao_briefing'
  | 'proposta_enviada'
  | 'negociacao'
  | 'fechado'
  | 'perdido'
export type TipoInteracao = 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'nota'
export type UserRole = 'socio' | 'gestor_comercial' | 'gestor_trafego'

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  last_activity_at: string
  name: string
  phone: string | null
  instagram: string | null
  origem: Origem | null
  campanha: string | null
  tem_terreno: boolean
  localizacao_terreno: string | null
  tem_projeto: boolean
  precisa_financiamento: boolean
  orcamento_desejado: number | null
  tipo_interesse: TipoInteresse | null
  etapa: EtapaLead
  motivo_perda: string | null
  responsavel_id: string | null
  notas: string | null
  responsavel?: { full_name: string; role: UserRole } | null
}

export interface Interacao {
  id: string
  lead_id: string
  user_id: string
  created_at: string
  tipo: TipoInteracao
  descricao: string
  usuario?: { full_name: string } | null
}
