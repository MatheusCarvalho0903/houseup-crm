'use client'

import { Menu, LogOut, User } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { useUser } from '@/hooks/useUser'

interface HeaderProps {
  onMenuClick: () => void
}

const roleLabel: Record<string, string> = {
  socio: 'Sócio',
  gestor_comercial: 'Gestor Comercial',
  gestor_trafego: 'Gestor de Tráfego',
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, profile } = useUser()

  const displayName =
    profile?.full_name ??
    (user?.email ? user.email.split('@')[0] : null) ??
    'Usuário'

  const displayRole = profile?.role ? roleLabel[profile.role] : null

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} className="text-[#1B2B4B]" />
      </button>

      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1B2B4B] flex items-center justify-center shrink-0">
            <User size={15} className="text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 leading-tight">
              {displayName}
            </p>
            {displayRole && (
              <p className="text-xs text-gray-500 leading-tight">{displayRole}</p>
            )}
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-[#1B2B4B] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Sair</span>
          </button>
        </form>
      </div>
    </header>
  )
}
