export type Profile = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DashboardMetric = {
  id: string
  metric_key: 'videos_uploaded' | 'bundles_left_to_edit' | 'sr_script_ready'
  metric_name: string
  current_value: number
  target_value: number | null
  updated_by: string | null
  updated_at: string
  created_at: string
  profiles?: {
    name: string
  }
}

export type MetricUpdateHistory = {
  id: string
  metric_id: string
  metric_key: string
  previous_value: number
  new_value: number
  change_value: number
  updated_by: string | null
  note: string | null
  created_at: string
  profiles?: {
    name: string
  }
}

export type Settings = {
  id: string
  video_target: number
  bundle_target: number | null
  sr_script_target: number | null
  stale_threshold: number
  created_at: string
  updated_at: string
}
