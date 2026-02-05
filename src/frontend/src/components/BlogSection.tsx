import { useGetAllBlogPosts, useIsCallerAdmin, useTrackElementClick } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import EditableSection from './EditableSection';
import type { BlogPost, SiteContent } from '../backend';

interface BlogSectionProps {
  onPostClick: (post: BlogPost) => void;
  siteContent?: SiteContent;
  customTitle?: string;
  customDescription?: string;
}

export default function BlogSection({ onPostClick, siteContent, customTitle, customDescription }: BlogSectionProps) {
  const { data: posts, isLoading } = useGetAllBlogPosts();
  const { data: isAdmin } = useIsCallerAdmin();
  const trackClick = useTrackElementClick();

  const title = customTitle || siteContent?.blogTitle || 'Blog';
  const description = customDescription || siteContent?.blogDescription || 'Hier finden Sie unsere neuesten Blogbeiträge.';

  const handlePostClick = (post: BlogPost) => {
    trackClick.mutate(`blog-post-${post.id}`);
    onPostClick(post);
  };

  return (
    <section id="blog" className="py-16 bg-muted/50">
      <div className="container">
        <EditableSection
          title={title}
          description={description}
          contentKey="blog"
          isAdmin={!!isAdmin}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={() => handlePostClick(post)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(Number(post.publicationDate) / 1000000).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Noch keine Blogbeiträge vorhanden.</p>
          </div>
        )}
      </div>
    </section>
  );
}
