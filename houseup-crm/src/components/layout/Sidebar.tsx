'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, GitBranch, UsersRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isSocio: boolean
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
]

export function Sidebar({ isOpen, onClose, isSocio }: SidebarProps) {
  const pathname = usePathname()

  const linkCls = (href: string) =>
    cn(
      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
      pathname === href
        ? 'bg-white/20 text-white'
        : 'text-white/65 hover:bg-white/10 hover:text-white'
    )

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-full w-64 bg-[#1B2B4B] text-white transition-transform duration-300 ease-in-out',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <span className="text-lg font-bold tracking-tight">HouseUp CRM</span>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 mt-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose} className={linkCls(href)}>
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {isSocio && (
            <>
              <div className="mx-4 my-2 border-t border-white/10" />
              <Link href="/usuarios" onClick={onClose} className={linkCls('/usuarios')}>
                <UsersRound size={18} />
                Usuários
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
