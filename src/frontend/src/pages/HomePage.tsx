import { useState, useEffect } from 'react';
import BlogSection from '../components/BlogSection';
import StoreItemSection from '../components/StoreItemSection';
import MeetingSection from '../components/MeetingSection';
import Mp3PlayerSection from '../components/Mp3PlayerSection';
import LivestreamSection from '../components/LivestreamSection';
import LinksSection from '../components/LinksSection';
import CustomSection from '../components/CustomSection';
import BlogPostModal from '../components/BlogPostModal';
import { useGetHomepageSections, useGetSiteContent, useTrackPageVisit, useTrackSectionView, useIsCallerAdmin, useTrackUniqueVisitor } from '../hooks/useQueries';
import type { BlogPost } from '../backend';
import { Skeleton } from '../components/ui/skeleton';
import { shouldTrackVisitToday, setLastTrackedDate, getCurrentLocalDate, getOrCreateVisitorSessionId } from '../utils/dailyVisitorTracking';

export default function HomePage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { data: sections, isLoading: sectionsLoading } = useGetHomepageSections();
  const { data: siteContent, isLoading: contentLoading } = useGetSiteContent();
  const { data: isAdmin } = useIsCallerAdmin();
  const trackPageVisit = useTrackPageVisit();
  const trackSectionView = useTrackSectionView();
  const trackUniqueVisitor = useTrackUniqueVisitor();

  useEffect(() => {
    trackPageVisit.mutate('home');

    // Track unique daily visitor if not admin and not tracked today
    if (isAdmin === false && shouldTrackVisitToday()) {
      const sessionId = getOrCreateVisitorSessionId();
      trackUniqueVisitor.mutate(sessionId, {
        onSuccess: () => {
          setLastTrackedDate(getCurrentLocalDate());
        },
      });
    }
  }, [isAdmin]);

  if (sectionsLoading || contentLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <>
        <BlogSection onPostClick={setSelectedPost} siteContent={siteContent} />
        <StoreItemSection siteContent={siteContent} />
        <MeetingSection siteContent={siteContent} />
        {selectedPost && (
          <BlogPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </>
    );
  }

  const visibleSections = sections.filter(section => section.visible || isAdmin);

  return (
    <>
      {visibleSections.map((section) => {
        const sectionType = section.sectionType;
        
        if ('blog' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <BlogSection 
                onPostClick={setSelectedPost}
                siteContent={siteContent}
                customTitle={section.title}
                customDescription={section.description}
              />
            </div>
          );
        }
        
        if ('storeItems' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <StoreItemSection 
                siteContent={siteContent}
                customTitle={section.title}
                customDescription={section.description}
              />
            </div>
          );
        }
        
        if ('meetings' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <MeetingSection 
                siteContent={siteContent}
                customTitle={section.title}
                customDescription={section.description}
              />
            </div>
          );
        }

        if ('mp3Player' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <Mp3PlayerSection 
                customTitle={section.title}
                customDescription={section.description}
              />
            </div>
          );
        }

        if ('livestream' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <LivestreamSection 
                siteContent={siteContent}
                customTitle={section.title}
                customDescription={section.description}
              />
            </div>
          );
        }

        if ('links' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <LinksSection 
                siteContent={siteContent}
                customTitle={section.title}
                customDescription={section.description}
              />
            </div>
          );
        }
        
        if ('custom' in sectionType) {
          return (
            <div key={section.id} onMouseEnter={() => trackSectionView.mutate(section.id)}>
              <CustomSection
                section={section}
              />
            </div>
          );
        }
        
        return null;
      })}
      
      {selectedPost && (
        <BlogPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}
