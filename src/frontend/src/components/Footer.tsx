import { Heart } from 'lucide-react';
import { useGetSiteContent, useIsCallerAdmin, useUpdateSiteContent } from '../hooks/useQueries';
import { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

export default function Footer() {
  const { data: siteContent } = useGetSiteContent();
  const { data: isAdmin } = useIsCallerAdmin();
  const updateContent = useUpdateSiteContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFooter, setEditedFooter] = useState('');

  const footerContent = siteContent?.footerContent || '© 2025. Mit ❤️ erstellt mit caffeine.ai';

  const handleEdit = () => {
    setEditedFooter(footerContent);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!siteContent) return;

    try {
      await updateContent.mutateAsync({
        ...siteContent,
        footerContent: editedFooter,
      });
      toast.success('Footer erfolgreich aktualisiert');
      setIsEditing(false);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Footers');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditedFooter(footerContent);
    setIsEditing(false);
  };

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {isEditing && isAdmin ? (
            <div className="w-full max-w-md space-y-2">
              <Textarea
                value={editedFooter}
                onChange={(e) => setEditedFooter(e.target.value)}
                className="text-center resize-none"
                rows={2}
              />
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateContent.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Speichern
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateContent.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                © 2025. Mit <Heart className="h-4 w-4 text-red-500 fill-red-500" /> erstellt mit{' '}
                <a 
                  href="https://caffeine.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleEdit}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Footer bearbeiten
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
