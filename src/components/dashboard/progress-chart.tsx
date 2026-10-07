'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MetricUpdateHistory } from '@/types/database'
import { format, parseISO } from 'date-fns'

export function ProgressChart({ history }: { history: MetricUpdateHistory[] }) {
  const [selectedMetric, setSelectedMetric] = useState('videos_uploaded')

  // Filter history for selected metric and process into chart data
  // We want to show the trend over time.
  const filteredHistory = history
    .filter(h => h.metric_key === selectedMetric)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Create a daily rollup or just plot the points
  // For simplicity, we plot the latest value for each day
  const dailyData: Record<string, number> = {}
  
  filteredHistory.forEach(record => {
    const dateStr = format(new Date(record.created_at), 'MMM d')
    dailyData[dateStr] = record.new_value
  })

  const chartData = Object.entries(dailyData).map(([date, value]) => ({
    date,
    value
  }))

  const metricName = 
    selectedMetric === 'videos_uploaded' ? 'Videos Uploaded' :
    selectedMetric === 'bundles_left_to_edit' ? 'Bundles Left to Edit' :
    'SR + Script Ready'

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Progress Trend</CardTitle>
          <CardDescription>Track the production velocity over time.</CardDescription>
        </div>
        <Select value={selectedMetric} onValueChange={(val) => val && setSelectedMetric(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="videos_uploaded">Videos Uploaded</SelectItem>
            <SelectItem value="bundles_left_to_edit">Bundles Left to Edit</SelectItem>
            <SelectItem value="sr_script_ready">SR + Script Ready</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={metricName}
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-md mt-4">
            Not enough data to display trend
          </div>
        )}
      </CardContent>
    </Card>
  )
}
