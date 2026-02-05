import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Edit2, Save, X } from 'lucide-react';
import { useGetSiteContent, useUpdateSiteContent } from '../hooks/useQueries';
import { toast } from 'sonner';

interface EditableSectionProps {
  title: string;
  description: string;
  contentKey: 'blog' | 'storeItems' | 'meeting' | 'mp3Player' | 'livestream' | 'links';
  isAdmin: boolean;
}

export default function EditableSection({ title, description, contentKey, isAdmin }: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const { data: siteContent } = useGetSiteContent();
  const updateContent = useUpdateSiteContent();

  const handleSave = async () => {
    if (!siteContent) return;

    const updatedContent = { ...siteContent };

    switch (contentKey) {
      case 'blog':
        updatedContent.blogTitle = editedTitle;
        updatedContent.blogDescription = editedDescription;
        break;
      case 'storeItems':
        updatedContent.storeItemsTitle = editedTitle;
        updatedContent.storeItemsDescription = editedDescription;
        break;
      case 'meeting':
        updatedContent.meetingTitle = editedTitle;
        updatedContent.meetingDescription = editedDescription;
        break;
      case 'mp3Player':
        updatedContent.mp3PlayerTitle = editedTitle;
        updatedContent.mp3PlayerDescription = editedDescription;
        break;
      case 'livestream':
        updatedContent.livestreamTitle = editedTitle;
        updatedContent.livestreamDescription = editedDescription;
        break;
      case 'links':
        updatedContent.linksTitle = editedTitle;
        updatedContent.linksDescription = editedDescription;
        break;
    }

    try {
      await updateContent.mutateAsync(updatedContent);
      toast.success('Änderungen gespeichert');
      setIsEditing(false);
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return (
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mb-12 space-y-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-2xl font-bold text-center"
          />
        </div>
        <div className="space-y-2">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-center resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleSave} size="sm" disabled={updateContent.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Speichern
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 text-center group relative">
      <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
      <Button
        onClick={() => setIsEditing(true)}
        size="sm"
        variant="ghost"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="mr-2 h-4 w-4" />
        Inhalt bearbeiten
      </Button>
    </div>
  );
}
