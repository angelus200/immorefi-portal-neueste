/**
 * Analytics Dashboard
 * Displays landing page analytics: page views, unique visitors, top pages, referrers
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, Eye, TrendingUp, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TimePeriod = 'today' | '7days' | '30days' | '90days' | 'all';

function AnalyticsContent() {
  const [period, setPeriod] = useState<TimePeriod>('30days');

  const { data, isLoading } = trpc.analytics.getDashboard.useQuery({ period });

  const periodLabels: Record<TimePeriod, string> = {
    today: 'Heute',
    '7days': 'Letzte 7 Tage',
    '30days': 'Letzte 30 Tage',
    '90days': 'Letzte 90 Tage',
    all: 'Gesamte Zeit',
  };

  // Format date for chart display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  // Transform time series data for Recharts
  const chartData = data?.timeSeries?.map((item) => ({
    date: formatDate(item.date),
    'Seitenaufrufe': item.views,
    'Unique Visitors': item.uniqueVisitors,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Besucherstatistiken der Landing Page</p>
        </div>
        <div className="w-[200px]">
          <Select value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="7days">Letzte 7 Tage</SelectItem>
              <SelectItem value="30days">Letzte 30 Tage</SelectItem>
              <SelectItem value="90days">Letzte 90 Tage</SelectItem>
              <SelectItem value="all">Gesamte Zeit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Laden...
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Besucher Heute</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.overview.viewsToday || 0}</div>
                <p className="text-xs text-muted-foreground">Seitenaufrufe</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diese Woche</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.overview.viewsThisWeek || 0}</div>
                <p className="text-xs text-muted-foreground">Seitenaufrufe</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dieser Monat</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.overview.viewsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">Seitenaufrufe</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.overview.uniqueVisitors || 0}</div>
                <p className="text-xs text-muted-foreground">{periodLabels[period]}</p>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Besucher-Trend</CardTitle>
              <CardDescription>Seitenaufrufe und Unique Visitors der letzten 30 Tage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Seitenaufrufe"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Unique Visitors"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Pages & Top Referrers */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top-Seiten</CardTitle>
                <CardDescription>Meistbesuchte Seiten</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.topPages && data.topPages.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seite</TableHead>
                        <TableHead className="text-right">Aufrufe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topPages.map((page, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{page.page}</TableCell>
                          <TableCell className="text-right font-medium">{page.views}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Daten vorhanden
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle>Top-Referrer</CardTitle>
                <CardDescription>Woher kommen die Besucher</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.topReferrers && data.topReferrers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quelle</TableHead>
                        <TableHead className="text-right">Aufrufe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topReferrers.map((referrer, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {referrer.referrer === 'Direct' ? (
                              <span className="text-muted-foreground">Direktzugriff</span>
                            ) : (
                              <a
                                href={referrer.referrer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {new URL(referrer.referrer).hostname}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">{referrer.views}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Daten vorhanden
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung ({periodLabels[period]})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt Seitenaufrufe</p>
                  <p className="text-2xl font-bold">{data?.overview.totalViews || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                  <p className="text-2xl font-bold">{data?.overview.uniqueVisitors || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ø Seiten pro Besucher</p>
                  <p className="text-2xl font-bold">
                    {data?.overview.uniqueVisitors
                      ? (data.overview.totalViews / data.overview.uniqueVisitors).toFixed(2)
                      : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <DashboardLayout>
      <AnalyticsContent />
    </DashboardLayout>
  );
}
