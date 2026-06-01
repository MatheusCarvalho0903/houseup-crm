'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'

export function LoginClient() {
  const [state, formAction, isPending] = useActionState(signIn, null)

  return (
    <div className="min-h-screen bg-[#1B2B4B] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1B2B4B] mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">HouseUp CRM</h1>
          <p className="text-gray-500 mt-1 text-sm">Faça login para continuar</p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/30 focus:border-[#1B2B4B] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]/30 focus:border-[#1B2B4B] transition"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#1B2B4B] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#243a63] active:bg-[#152238] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
