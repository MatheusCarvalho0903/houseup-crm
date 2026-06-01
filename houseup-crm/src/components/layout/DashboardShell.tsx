'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import type { UserProfile } from '@/lib/types'

interface DashboardShellProps {
  children: React.ReactNode
  profile: UserProfile | null
  userEmail: string | null
}

export function DashboardShell({ children, profile, userEmail }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          profile={profile}
          userEmail={userEmail}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
