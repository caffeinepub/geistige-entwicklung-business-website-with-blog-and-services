import { useGetAnalyticsData, useClearAnalyticsData } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Eye, MousePointer, LayoutGrid, Users, RefreshCw, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// Map section IDs to German labels
const getSectionLabel = (sectionId: string): string => {
  const labelMap: Record<string, string> = {
    'blog': 'Blog',
    'storeItems': 'eBooks',
    'meetings': 'Termine',
    'mp3Player': 'MP3-Player',
    'livestream': 'Livestream',
    'links': 'Links',
  };
  
  return labelMap[sectionId] || sectionId;
};

// Convert day key (days since epoch) to YYYY-MM-DD format
const dayKeyToDate = (dayKey: string): string => {
  try {
    const daysSinceEpoch = parseInt(dayKey, 10);
    if (isNaN(daysSinceEpoch)) return dayKey;
    
    const millisPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(daysSinceEpoch * millisPerDay);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return dayKey;
  }
};

export default function AnalyticsManagement() {
  const { data: analytics, isLoading, refetch, isRefetching } = useGetAnalyticsData();
  const clearAnalytics = useClearAnalyticsData();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleReload = async () => {
    try {
      await refetch();
      toast.success('Analytics-Daten erfolgreich aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Analytics-Daten');
      console.error('Reload error:', error);
    }
  };

  const handleReset = async () => {
    try {
      await clearAnalytics.mutateAsync();
      setIsResetDialogOpen(false);
      toast.success('Analytics-Daten erfolgreich zurückgesetzt');
    } catch (error) {
      toast.error('Fehler beim Zurücksetzen der Analytics-Daten');
      console.error('Reset error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Keine Analytics-Daten verfügbar</p>
      </div>
    );
  }

  // Convert BigInt to Number for charts and apply German labels
  const pageVisitsData = analytics.pageVisits.map(([page, count]) => ({
    name: page === 'home' ? 'Startseite' : page,
    visits: Number(count),
  }));

  const elementClicksData = analytics.elementClicks.map(([element, count]) => {
    // Extract readable labels from element IDs
    let label = element;
    if (element.startsWith('blog-post-')) {
      label = 'Blog-Beitrag';
    } else if (element.startsWith('storeItem-')) {
      label = 'eBook';
    } else if (element.startsWith('link-')) {
      label = 'Link';
    } else if (element === 'mp3-play') {
      label = 'MP3-Player';
    }
    
    return {
      name: label,
      clicks: Number(count),
    };
  });

  const sectionViewsData = analytics.sectionViews.map(([section, count]) => ({
    name: getSectionLabel(section),
    views: Number(count),
  }));

  // Process daily visitors data
  const dailyVisitorsData = (analytics.dailyVisitors || [])
    .map(([dayKey, count]) => ({
      date: dayKeyToDate(dayKey),
      visitors: Number(count),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate totals
  const totalPageVisits = pageVisitsData.reduce((sum, item) => sum + item.visits, 0);
  const totalElementClicks = elementClicksData.reduce((sum, item) => sum + item.clicks, 0);
  const totalSectionViews = sectionViewsData.reduce((sum, item) => sum + item.views, 0);
  const totalDailyVisitors = dailyVisitorsData.reduce((sum, item) => sum + item.visitors, 0);

  // Get most viewed section
  const mostViewedSection = sectionViewsData.length > 0
    ? sectionViewsData.reduce((max, item) => item.views > max.views ? item : max, sectionViewsData[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Übersicht über Besucheraktivitäten</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReload}
            disabled={isRefetching}
            variant="outline"
            size="sm"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Aktualisieren
          </Button>
          
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={clearAnalytics.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Analytics-Daten zurücksetzen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion löscht alle Analytics-Daten unwiderruflich. Alle Besucherstatistiken, Klicks, Seitenaufrufe und täglichen Besucherzahlen werden gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={clearAnalytics.isPending}
                >
                  {clearAnalytics.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Wird zurückgesetzt...
                    </>
                  ) : (
                    'Zurücksetzen'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Besucher-Analytics</AlertTitle>
        <AlertDescription>
          Diese Statistiken zeigen nur die Aktivitäten von Besuchern. Admin-Aktivitäten werden nicht erfasst.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Besucher-Aufrufe</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageVisits}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt über alle Seiten (nur Besucher)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Besucher-Klicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElementClicks}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt über alle Elemente (nur Besucher)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Besucher-Abschnittsansichten</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSectionViews}</div>
            <p className="text-xs text-muted-foreground">
              {mostViewedSection ? `Meistgesehen: ${mostViewedSection.name}` : 'Keine Daten'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tägliche Besucher</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDailyVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt über alle Tage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Page Visits Chart */}
        {pageVisitsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Besucher-Aufrufe</CardTitle>
              <CardDescription>Anzahl der Besuche pro Seite (nur Besucher)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Section Views Chart */}
        {sectionViewsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Besucher-Abschnittsansichten</CardTitle>
              <CardDescription>Verteilung der Ansichten nach Abschnitt (nur Besucher)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sectionViewsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="views"
                  >
                    {sectionViewsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Element Clicks Chart */}
        {elementClicksData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Besucher-Klicks nach Bereich</CardTitle>
              <CardDescription>Anzahl der Klicks pro Bereich (nur Besucher)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={elementClicksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily Visitors Chart */}
      {dailyVisitorsData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tägliche Besucher</CardTitle>
            <CardDescription>Anzahl der eindeutigen Besucher pro Tag (nur Besucher)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyVisitorsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tägliche Besucher</CardTitle>
            <CardDescription>Anzahl der eindeutigen Besucher pro Tag (nur Besucher)</CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                Noch keine täglichen Besucherdaten vorhanden. Daten werden gesammelt, sobald Besucher Ihre Website besuchen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Labels Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Abschnitt-Bezeichnungen</CardTitle>
          <CardDescription>Übersicht der Abschnitte auf Ihrer Website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm font-medium">Blog</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-sm font-medium">eBooks</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Termine</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm font-medium">MP3-Player</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium">Livestream</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-sm font-medium">Links</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {pageVisitsData.length === 0 && elementClicksData.length === 0 && sectionViewsData.length === 0 && dailyVisitorsData.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                Noch keine Analytics-Daten vorhanden. Daten werden gesammelt, sobald Besucher Ihre Website besuchen.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (Admin-Aktivitäten werden nicht erfasst)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
