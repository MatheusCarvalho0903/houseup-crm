'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Edit2, X, Copy, Check, Users } from 'lucide-react'
import { inviteUser, editUser } from '@/app/actions/usuarios'
import type { UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string
  full_name: string
  role: UserRole
  created_at: string
  email: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const roleLabels: Record<UserRole, string> = {
  socio: 'Sócio',
  gestor_comercial: 'Gestor Comercial',
  gestor_trafego: 'Gestor de Tráfego',
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'socio', label: 'Sócio' },
  { value: 'gestor_comercial', label: 'Gestor Comercial' },
  { value: 'gestor_trafego', label: 'Gestor de Tráfego' },
]

const ACCESS_LINK = 'https://houseup-crm.vercel.app/login'

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toast({
  msg,
  type,
  onDismiss,
}: {
  msg: string
  type: 'success' | 'error'
  onDismiss: () => void
}) {
  return (
    <div
      className={cn(
        'fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm',
        type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      )}
    >
      <span className="flex-1">{msg}</span>
      <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/20 focus:border-[#1B2B4B] bg-white'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

// ── Main component ────────────────────────────────────────────────────────────

export function UsuariosClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter()

  const [modalType, setModalType] = useState<'invite' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [inviteSuccessEmail, setInviteSuccessEmail] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function openEdit(user: UserRow) {
    setEditingUser(user)
    setModalType('edit')
  }

  function closeModal() {
    setModalType(null)
    setEditingUser(null)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(ACCESS_LINK)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      showToast('Não foi possível copiar. Copie manualmente: ' + ACCESS_LINK, 'error')
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2B4B]">Usuários</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie o acesso da equipe ao CRM
            </p>
          </div>
          <button
            onClick={() => setModalType('invite')}
            className="flex items-center gap-2 bg-[#1B2B4B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#243a63] transition-colors shrink-0"
          >
            <UserPlus size={16} />
            Convidar Usuário
          </button>
        </div>

        {/* Invite success card */}
        {inviteSuccessEmail && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Check size={16} className="text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                Convite enviado para{' '}
                <span className="font-semibold">{inviteSuccessEmail}</span>.
                Compartilhe o link de acesso via WhatsApp:
              </p>
            </div>
            <button
              onClick={copyLink}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0',
                copiedLink
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-green-300 text-green-800 hover:bg-green-100'
              )}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Copiado!' : 'Copiar link de acesso'}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {initialUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={32} className="mb-3 opacity-40" />
              <p className="text-sm">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Nome</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Cargo</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Cadastrado em</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        {user.full_name}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {user.email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Ativo
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => openEdit(user)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#1B2B4B] hover:underline"
                        >
                          <Edit2 size={13} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {modalType === 'invite' && (
        <InviteModal
          onClose={closeModal}
          onSuccess={(email) => {
            closeModal()
            setInviteSuccessEmail(email)
            showToast(`Convite enviado para ${email}`)
            router.refresh()
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Edit Modal */}
      {modalType === 'edit' && editingUser && (
        <EditModal
          user={editingUser}
          onClose={closeModal}
          onSuccess={(msg) => {
            closeModal()
            showToast(msg)
            router.refresh()
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </>
  )
}

// ── RoleBadge ─────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    socio: 'bg-[#1B2B4B]/10 text-[#1B2B4B]',
    gestor_comercial: 'bg-blue-100 text-blue-700',
    gestor_trafego: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', styles[role])}>
      {roleLabels[role]}
    </span>
  )
}

// ── InviteModal ───────────────────────────────────────────────────────────────

function InviteModal({
  onClose,
  onSuccess,
  onError,
}: {
  onClose: () => void
  onSuccess: (email: string) => void
  onError: (msg: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setFieldError('')
    const formData = new FormData(e.currentTarget)
    const result = await inviteUser(null, formData)
    setLoading(false)
    if ('error' in result) {
      setFieldError(result.error)
    } else {
      onSuccess(result.success)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-lg font-bold text-[#1B2B4B] mb-5">Convidar Usuário</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Nome completo *</label>
          <input
            name="full_name"
            type="text"
            required
            autoFocus
            className={inputCls}
            placeholder="Nome do colaborador"
          />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input
            name="email"
            type="email"
            required
            className={inputCls}
            placeholder="email@exemplo.com"
          />
        </div>
        <div>
          <label className={labelCls}>Cargo *</label>
          <select name="role" required className={inputCls} defaultValue="">
            <option value="" disabled>Selecionar cargo...</option>
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {fieldError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
            {fieldError}
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
            {loading ? 'Enviando convite...' : 'Enviar Convite'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ── EditModal ─────────────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSuccess,
  onError,
}: {
  user: UserRow
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setFieldError('')
    const formData = new FormData(e.currentTarget)
    const result = await editUser(null, formData)
    setLoading(false)
    if ('error' in result) {
      setFieldError(result.error)
    } else {
      onSuccess(result.success)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-lg font-bold text-[#1B2B4B] mb-5">Editar Usuário</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={user.id} />

        <div>
          <label className={labelCls}>Nome completo *</label>
          <input
            name="full_name"
            type="text"
            required
            defaultValue={user.full_name}
            className={inputCls}
          />
        </div>

        {user.email && (
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className={cn(inputCls, 'bg-gray-50 text-gray-400 cursor-not-allowed')}
            />
            <p className="text-xs text-gray-400 mt-1">
              O email não pode ser alterado.
            </p>
          </div>
        )}

        <div>
          <label className={labelCls}>Cargo *</label>
          <select name="role" required defaultValue={user.role} className={inputCls}>
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {fieldError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
            {fieldError}
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
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ── ModalOverlay ──────────────────────────────────────────────────────────────

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
