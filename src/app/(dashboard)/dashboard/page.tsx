import { createClient } from '@/lib/supabase/server'
import { DashboardMetric, Settings, MetricUpdateHistory } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format, differenceInDays } from 'date-fns'
import { UpdateSingleMetricModal } from '@/components/dashboard/update-single-metric-modal'
import { ProgressChart } from '@/components/dashboard/progress-chart'
import { AlertTriangle } from 'lucide-react'

export const instant = false

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch metrics
  const { data: metricsData } = await supabase
    .from('dashboard_metrics')
    .select('*, profiles(name)')

  const metrics = metricsData as DashboardMetric[] || []

  // Fetch settings
  const { data: settingsData } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()

  const settings = settingsData as Settings || { video_target: 365, bundle_target: null, sr_script_target: null, stale_threshold: 3 }

  // Fetch today's activity
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  
  const { data: activityData } = await supabase
    .from('metric_update_history')
    .select('*, profiles(name)')
    .gte('created_at', startOfToday.toISOString())
    .order('created_at', { ascending: false })
    .limit(10)

  const activities = activityData as MetricUpdateHistory[] || []

  // Fetch all history for chart
  const { data: allHistory } = await supabase
    .from('metric_update_history')
    .select('*')
    .order('created_at', { ascending: true })

  const chartHistory = allHistory as MetricUpdateHistory[] || []

  const videosMetric = metrics.find(m => m.metric_key === 'videos_uploaded')
  const bundlesMetric = metrics.find(m => m.metric_key === 'bundles_left_to_edit')
  const srScriptMetric = metrics.find(m => m.metric_key === 'sr_script_ready')

  // Calculate videos progress
  const videoTarget = settings.video_target || 365
  const uploadedVideos = videosMetric?.current_value || 0
  const videosPercent = Math.min(100, Math.round((uploadedVideos / videoTarget) * 100))

  // Check for stale data
  const staleThreshold = settings.stale_threshold || 3
  const now = new Date()

  const isVideosStale = videosMetric?.updated_at && differenceInDays(now, new Date(videosMetric.updated_at)) >= staleThreshold
  const isBundlesStale = bundlesMetric?.updated_at && differenceInDays(now, new Date(bundlesMetric.updated_at)) >= staleThreshold
  const isSRStale = srScriptMetric?.updated_at && differenceInDays(now, new Date(srScriptMetric.updated_at)) >= staleThreshold

  const staleMetrics = [
    isVideosStale ? 'Videos Uploaded' : null,
    isBundlesStale ? 'Bundles Left to Edit' : null,
    isSRStale ? 'SR + Script Ready' : null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Current status of AI365 content production.
          </p>
        </div>
      </div>

      {staleMetrics.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stale Data Warning</AlertTitle>
          <AlertDescription>
            The following metrics haven't been updated in {staleThreshold} or more days: <span className="font-semibold">{staleMetrics.join(', ')}</span>.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Videos Uploaded */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">AI365 Videos Uploaded</CardTitle>
            <UpdateSingleMetricModal metric={videosMetric} metricKey="videos_uploaded" title="Videos Uploaded" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold">{uploadedVideos} / {videoTarget}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {videosPercent}% Complete · {Math.max(0, videoTarget - uploadedVideos)} Remaining
            </div>
            <Progress value={videosPercent} className="mt-3" />
            <div className="mt-4 text-xs text-muted-foreground">
              {videosMetric?.updated_at ? (
                <>
                  Last updated: {format(new Date(videosMetric.updated_at), 'MMM d, yyyy h:mm a')}
                  <br />
                  by {videosMetric.profiles?.name || 'Unknown'}
                </>
              ) : (
                'Never updated'
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Bundles Left */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">Bundles Left to Edit</CardTitle>
            <UpdateSingleMetricModal metric={bundlesMetric} metricKey="bundles_left_to_edit" title="Bundles Left to Edit" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold">{bundlesMetric?.current_value || 0} Bundles</div>
            <div className="mt-4 text-xs text-muted-foreground">
              {bundlesMetric?.updated_at ? (
                <>
                  Last updated: {format(new Date(bundlesMetric.updated_at), 'MMM d, yyyy h:mm a')}
                  <br />
                  by {bundlesMetric.profiles?.name || 'Unknown'}
                </>
              ) : (
                'Never updated'
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: SR + Script Ready */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">SR + Script Ready</CardTitle>
              <CardDescription>Audio Excluded</CardDescription>
            </div>
            <UpdateSingleMetricModal metric={srScriptMetric} metricKey="sr_script_ready" title="SR + Script Ready" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold">{srScriptMetric?.current_value || 0} Bundles</div>
            <div className="mt-4 text-xs text-muted-foreground">
              {srScriptMetric?.updated_at ? (
                <>
                  Last updated: {format(new Date(srScriptMetric.updated_at), 'MMM d, yyyy h:mm a')}
                  <br />
                  by {srScriptMetric.profiles?.name || 'Unknown'}
                </>
              ) : (
                'Never updated'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Progress Chart */}
        <ProgressChart history={chartHistory} />

        {/* Today's Activity */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Recent updates made by the team today.</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">
                        {activity.profiles?.name} updated <span className="font-semibold">{
                          activity.metric_key === 'videos_uploaded' ? 'Videos Uploaded' :
                          activity.metric_key === 'bundles_left_to_edit' ? 'Bundles Left to Edit' :
                          'SR + Script Ready'
                        }</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.previous_value} → {activity.new_value}
                        {activity.change_value !== 0 && (
                          <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            activity.change_value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {activity.change_value > 0 ? '+' : ''}{activity.change_value}
                          </span>
                        )}
                      </p>
                      {activity.note && (
                        <p className="text-sm italic text-gray-500 mt-1">"{activity.note}"</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No updates have been recorded today.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
