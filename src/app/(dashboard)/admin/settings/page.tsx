import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export const instant = false

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settingsData } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()

  const settings = settingsData || { video_target: 365, bundle_target: null, sr_script_target: null, stale_threshold: 3 }

  async function saveSettings(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) return

    // Simple auth check - ideally you'd verify ADMIN role here
    
    const videoTarget = parseInt(formData.get('video_target') as string, 10)
    const staleThreshold = parseInt(formData.get('stale_threshold') as string, 10)

    if (settingsData) {
      await supabaseServer.from('settings').update({
        video_target: videoTarget,
        stale_threshold: staleThreshold
      }).eq('id', settingsData.id)
    } else {
      await supabaseServer.from('settings').insert({
        video_target: videoTarget,
        stale_threshold: staleThreshold
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/settings')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure dashboard targets and options.
        </p>
      </div>

      <Card className="max-w-xl">
        <form action={saveSettings}>
          <CardHeader>
            <CardTitle>Production Targets</CardTitle>
            <CardDescription>Set the global targets for the production tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_target">Total Video Target</Label>
              <Input 
                id="video_target" 
                name="video_target" 
                type="number" 
                defaultValue={settings.video_target} 
                required 
              />
              <p className="text-xs text-muted-foreground">The total number of videos to be produced (Default: 365)</p>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="stale_threshold">Stale Data Warning (Days)</Label>
              <Input 
                id="stale_threshold" 
                name="stale_threshold" 
                type="number" 
                min="1"
                defaultValue={settings.stale_threshold} 
                required 
              />
              <p className="text-xs text-muted-foreground">Show a warning if a metric hasn't been updated in this many days (Default: 3)</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Settings</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
