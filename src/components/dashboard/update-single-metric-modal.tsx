'use client'

import { useState } from 'react'
import { DashboardMetric } from '@/types/database'
import { updateMetrics } from '@/app/actions/metrics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Edit2 } from 'lucide-react'

export function UpdateSingleMetricModal({ 
  metric, 
  metricKey,
  title
}: { 
  metric?: DashboardMetric, 
  metricKey: 'videos_uploaded' | 'bundles_left_to_edit' | 'sr_script_ready',
  title: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await updateMetrics(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${title} updated successfully`)
        setIsOpen(false)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs">
        <Edit2 className="mr-2 h-3.5 w-3.5" />
        Update
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update {title}</DialogTitle>
          <DialogDescription>
            Enter the new value for this metric.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={metricKey}>New Value</Label>
              <span className="text-xs text-muted-foreground">Current: {metric?.current_value || 0}</span>
            </div>
            <Input
              id={metricKey}
              name={metricKey}
              type="number"
              min="0"
              defaultValue={metric?.current_value}
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="note">Update Note (Optional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="e.g. Uploaded final 3 videos for Week 2"
              className="resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
