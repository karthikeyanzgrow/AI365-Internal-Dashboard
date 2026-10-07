'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMetrics(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get inputs
  const note = formData.get('note') as string
  const videosStr = formData.get('videos_uploaded') as string
  const bundlesStr = formData.get('bundles_left_to_edit') as string
  const srScriptStr = formData.get('sr_script_ready') as string

  // Fetch current
  const { data: metrics } = await supabase.from('dashboard_metrics').select('*')
  
  if (!metrics) return { error: 'Failed to fetch metrics' }

  // Array of updates to process
  const updates = []

  for (const metric of metrics) {
    let newValStr = null
    if (metric.metric_key === 'videos_uploaded') newValStr = videosStr
    if (metric.metric_key === 'bundles_left_to_edit') newValStr = bundlesStr
    if (metric.metric_key === 'sr_script_ready') newValStr = srScriptStr

    if (newValStr && newValStr !== '') {
      const newValue = parseInt(newValStr, 10)
      if (!isNaN(newValue) && newValue !== metric.current_value) {
        updates.push({
          metric,
          newValue,
          changeValue: newValue - metric.current_value
        })
      }
    }
  }

  if (updates.length === 0) {
    return { error: 'No values changed. Make sure you entered a different number.' }
  }

  // Process updates
  for (const update of updates) {
    // update metric
    const { error: updateError } = await supabase.from('dashboard_metrics').update({
      current_value: update.newValue,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }).eq('id', update.metric.id)

    if (updateError) {
      console.error('Error updating metric:', updateError)
      return { error: 'Failed to update metric. Check permissions.' }
    }

    // insert history
    await supabase.from('metric_update_history').insert({
      metric_id: update.metric.id,
      metric_key: update.metric.metric_key,
      previous_value: update.metric.current_value,
      new_value: update.newValue,
      change_value: update.changeValue,
      updated_by: user.id,
      note: note || null
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/history')

  return { success: true }
}
