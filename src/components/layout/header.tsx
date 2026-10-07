import { createClient } from '@/lib/supabase/server'
import { UserDropdown } from '@/components/layout/user-dropdown'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm z-10 relative">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI365 Production</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Content & Team Activity</p>
      </div>

      <div className="flex items-center gap-4">
        {profile && <UserDropdown profile={profile} />}
      </div>
    </header>
  )
}
