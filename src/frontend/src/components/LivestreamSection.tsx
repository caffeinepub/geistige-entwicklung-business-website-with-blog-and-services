import { useGetAllLivestreams, useIsCallerAdmin, useTrackElementClick } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Video, Loader2, ExternalLink, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import EditableSection from './EditableSection';
import type { SiteContent } from '../backend';

interface LivestreamSectionProps {
  siteContent?: SiteContent;
  customTitle?: string;
  customDescription?: string;
}

export default function LivestreamSection({ siteContent, customTitle, customDescription }: LivestreamSectionProps) {
  const { data: livestreams, isLoading } = useGetAllLivestreams();
  const { data: isAdmin } = useIsCallerAdmin();
  const trackClick = useTrackElementClick();

  const title = customTitle || siteContent?.livestreamTitle || 'Livestream';
  const description = customDescription || siteContent?.livestreamDescription || 'Sehen Sie unsere Live-Events.';

  const handleLivestreamClick = (livestreamId: string, externalLink: string) => {
    trackClick.mutate(`livestream-${livestreamId}`);
    window.open(externalLink, '_blank', 'noopener,noreferrer');
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return {
      date: date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const visibleLivestreams = livestreams?.filter(ls => ls.visible || isAdmin);

  return (
    <section id="livestream" className="py-16 bg-muted/30">
      <div className="container">
        <EditableSection
          title={title}
          description={description}
          contentKey="livestream"
          isAdmin={!!isAdmin}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visibleLivestreams && visibleLivestreams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleLivestreams.map((livestream, index) => {
              const { date, time } = formatDateTime(livestream.startTime);
              const isNewest = index === 0;
              return (
                <Card 
                  key={livestream.id} 
                  className={`overflow-hidden transition-all ${
                    isNewest 
                      ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' 
                      : ''
                  }`}
                >
                  <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2">{livestream.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {livestream.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{time} Uhr</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleLivestreamClick(livestream.id, livestream.externalLink)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {livestream.buttonLabel || 'Zum Livestream'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aktuell keine Livestreams geplant.</p>
          </div>
        )}
      </div>
    </section>
  );
}
