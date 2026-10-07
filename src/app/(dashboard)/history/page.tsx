import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export const instant = false

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: history } = await supabase
    .from('metric_update_history')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Update History</h2>
        <p className="text-muted-foreground">
          A complete log of all progress updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>The last 100 updates across all metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!history || history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                      No updates have been recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.metric_key === 'videos_uploaded' ? 'Videos Uploaded' :
                         record.metric_key === 'bundles_left_to_edit' ? 'Bundles Left' :
                         'SR + Script Ready'}
                      </TableCell>
                      <TableCell>{record.previous_value}</TableCell>
                      <TableCell>{record.new_value}</TableCell>
                      <TableCell>
                        <Badge variant={record.change_value > 0 ? 'default' : record.change_value < 0 ? 'destructive' : 'secondary'}
                               className={record.change_value > 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                          {record.change_value > 0 ? '+' : ''}{record.change_value}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.profiles?.name || 'Unknown'}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={record.note || ''}>
                        {record.note || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
