import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Edit2 } from 'lucide-react';
import type { BlogPost } from '../backend';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useState } from 'react';
import InlineEditBlogPost from './InlineEditBlogPost';

interface BlogPostModalProps {
  post: BlogPost;
  onClose: () => void;
}

export default function BlogPostModal({ post, onClose }: BlogPostModalProps) {
  const { data: isAdmin } = useIsCallerAdmin();
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderContent = (content: string) => {
    const parts = content.split(/!\[([^\]]*)\]\(([^)]+)\)/g);
    const elements: React.ReactElement[] = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        if (parts[i]) {
          // Split by double newlines to identify paragraphs
          const paragraphs = parts[i].split(/\n\n+/);
          paragraphs.forEach((para, idx) => {
            const trimmedPara = para.trim();
            if (trimmedPara) {
              elements.push(
                <p key={`text-${i}-${idx}`} className="whitespace-pre-wrap mb-6 leading-relaxed">
                  {trimmedPara}
                </p>
              );
            }
          });
        }
      } else if (i % 3 === 2) {
        const altText = parts[i - 1];
        const imageUrl = parts[i];
        elements.push(
          <img
            key={`img-${i}`}
            src={imageUrl}
            alt={altText || 'Blog image'}
            className="w-full max-w-2xl mx-auto rounded-lg my-8"
          />
        );
      }
    }

    return elements;
  };

  if (isEditing) {
    return (
      <Dialog open={true} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blogbeitrag bearbeiten</DialogTitle>
          </DialogHeader>
          <InlineEditBlogPost 
            post={post} 
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl font-bold pr-8">{post.title}</DialogTitle>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  title="Bearbeiten"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(post.publicationDate)}</p>
        </DialogHeader>
        <div className="mt-6 text-base leading-relaxed">
          {renderContent(post.content)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
