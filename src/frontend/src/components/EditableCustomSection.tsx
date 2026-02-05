import { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useUpdateHomepageSection } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { HomepageSection } from '../backend';

interface EditableCustomSectionProps {
  section: HomepageSection;
  isAdmin: boolean;
}

export default function EditableCustomSection({ section, isAdmin }: EditableCustomSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [editedDescription, setEditedDescription] = useState(section.description);
  const updateSection = useUpdateHomepageSection();

  const handleSave = async () => {
    const updatedSection: HomepageSection = {
      ...section,
      title: editedTitle,
      description: editedDescription,
    };

    try {
      await updateSection.mutateAsync({ id: section.id, section: updatedSection });
      toast.success('Abschnitt erfolgreich aktualisiert');
      setIsEditing(false);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Abschnitts');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(section.title);
    setEditedDescription(section.description);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return (
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {section.title}
        </h2>
        <p className="text-lg text-muted-foreground whitespace-pre-wrap">
          {section.description}
        </p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="space-y-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-center text-2xl font-bold"
            placeholder="Titel"
          />
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-center resize-none"
            rows={5}
            placeholder="Beschreibung"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateSection.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Speichern
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={updateSection.isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Abbrechen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-3xl mx-auto relative group">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
        {section.title}
      </h2>
      <p className="text-lg text-muted-foreground whitespace-pre-wrap">
        {section.description}
      </p>
      <Button
        size="sm"
        variant="outline"
        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Inhalt bearbeiten
      </Button>
    </div>
  );
}
