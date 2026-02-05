import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Loader2, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import BlogManagement from '../components/admin/BlogManagement';
import StoreItemManagement from '../components/admin/StoreItemManagement';
import MeetingManagement from '../components/admin/MeetingManagement';
import Mp3PlayerManagement from '../components/admin/Mp3PlayerManagement';
import LivestreamManagement from '../components/admin/LivestreamManagement';
import LinksManagement from '../components/admin/LinksManagement';
import PageManagement from '../components/admin/PageManagement';
import AnalyticsManagement from '../components/admin/AnalyticsManagement';
import QuickEditOverlay from '../components/QuickEditOverlay';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin-Dashboard</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihre Inhalte und Dienste</p>
            </div>
          </div>
          <Button onClick={() => setShowQuickEdit(true)} size="lg" className="gap-2">
            <Zap className="h-5 w-5" />
            Schnellbearbeitung
          </Button>
        </div>
      </div>

      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-auto">
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="meetings">Termine</TabsTrigger>
          <TabsTrigger value="mp3">MP3</TabsTrigger>
          <TabsTrigger value="livestream">Live</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="pages">Seiten</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog-Verwaltung</CardTitle>
              <CardDescription>Erstellen und verwalten Sie Blogbeiträge</CardDescription>
            </CardHeader>
            <CardContent>
              <BlogManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Items-Verwaltung</CardTitle>
              <CardDescription>Laden Sie Produkte hoch und verwalten Sie diese</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreItemManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Termin-Verwaltung</CardTitle>
              <CardDescription>Fügen Sie Termine hinzu und sehen Sie Buchungen ein</CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mp3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MP3-Player Verwaltung</CardTitle>
              <CardDescription>Laden Sie MP3-Dateien hoch und verwalten Sie Playlists</CardDescription>
            </CardHeader>
            <CardContent>
              <Mp3PlayerManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="livestream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Livestream-Verwaltung</CardTitle>
              <CardDescription>Planen und verwalten Sie Livestream-Events</CardDescription>
            </CardHeader>
            <CardContent>
              <LivestreamManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Links-Verwaltung</CardTitle>
              <CardDescription>Erstellen und verwalten Sie externe Link-Buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <LinksManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seitenverwaltung</CardTitle>
              <CardDescription>Verwalten Sie die Abschnitte und Inhalte Ihrer Homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <PageManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Sehen Sie Statistiken und Analysen zu Ihrer Website</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QuickEditOverlay
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
      />
    </div>
  );
}
