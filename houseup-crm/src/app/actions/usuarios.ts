'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/lib/types'

type ActionResult = { error: string } | { success: string }

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const validRoles: UserRole[] = ['socio', 'gestor_comercial', 'gestor_trafego']

export async function inviteUser(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const role = formData.get('role') as UserRole

  if (!full_name || !email || !role) {
    return { error: 'Todos os campos são obrigatórios.' }
  }
  if (!validRoles.includes(role)) {
    return { error: 'Cargo inválido.' }
  }

  const admin = getAdmin()

  const { data, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name } }
  )

  if (inviteError) {
    return { error: inviteError.message }
  }

  const userId = data.user.id

  const { error: profileError } = await admin
    .from('users_profiles')
    .upsert({ id: userId, full_name, role })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/usuarios')
  return { success: email }
}

export async function editUser(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get('id') as string
  const full_name = (formData.get('full_name') as string)?.trim()
  const role = formData.get('role') as UserRole

  if (!id || !full_name || !role) {
    return { error: 'Todos os campos são obrigatórios.' }
  }
  if (!validRoles.includes(role)) {
    return { error: 'Cargo inválido.' }
  }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('users_profiles')
    .update({ full_name, role })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/usuarios')
  return { success: 'Usuário atualizado com sucesso.' }
}
