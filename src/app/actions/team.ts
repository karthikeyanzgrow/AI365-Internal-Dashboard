'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTeamMember(formData: FormData) {
  const supabaseServer = await createServerClient()
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify the current user is an ADMIN
  const { data: currentProfile } = await supabaseServer
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentProfile || currentProfile.role !== 'ADMIN') {
    return { error: 'Only admins can add team members' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  // Use the service role client to bypass RLS and Auth restrictions for user creation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: name
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // The database trigger might have already created a profile, so we'll update it to ensure the correct role
  if (authData.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role, name })
      .eq('id', authData.user.id)
      
    if (profileError) {
       return { error: profileError.message }
    }
  }

  revalidatePath('/admin/team')
  return { success: true }
}
