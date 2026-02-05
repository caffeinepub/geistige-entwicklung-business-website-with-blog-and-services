import { useGetAllLinks, useIsCallerAdmin, useTrackElementClick } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Link as LinkIcon, Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import EditableSection from './EditableSection';
import type { SiteContent } from '../backend';

interface LinksSectionProps {
  siteContent?: SiteContent;
  customTitle?: string;
  customDescription?: string;
}

export default function LinksSection({ siteContent, customTitle, customDescription }: LinksSectionProps) {
  const { data: links, isLoading } = useGetAllLinks();
  const { data: isAdmin } = useIsCallerAdmin();
  const trackClick = useTrackElementClick();

  const title = customTitle || siteContent?.linksTitle || 'Links';
  const description = customDescription || siteContent?.linksDescription || 'Hier finden Sie nützliche Links zu externen Ressourcen.';

  const handleLinkClick = (linkId: string, url: string) => {
    trackClick.mutate(`link-${linkId}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const visibleLinks = links?.filter(link => link.visible || isAdmin);

  return (
    <section id="links" className="py-16 bg-background">
      <div className="container">
        <EditableSection
          title={title}
          description={description}
          contentKey="links"
          isAdmin={!!isAdmin}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visibleLinks && visibleLinks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleLinks.map((link) => (
              <Card key={link.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Button 
                    className="w-full h-auto py-4 text-base font-medium" 
                    onClick={() => handleLinkClick(link.id, link.url)}
                    variant="default"
                  >
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <LinkIcon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate text-left">{link.textLabel}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aktuell keine Links verfügbar.</p>
          </div>
        )}
      </div>
    </section>
  );
}
