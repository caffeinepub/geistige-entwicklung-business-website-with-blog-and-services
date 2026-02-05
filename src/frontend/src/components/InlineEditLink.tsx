import { useState, useEffect } from 'react';
import { useUpdateLink, useDeleteLink } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Save, X, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LinkItem } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface InlineEditLinkProps {
  link: LinkItem;
  onCancel?: () => void;
  onSave?: () => void;
}

export default function InlineEditLink({ link, onCancel, onSave }: InlineEditLinkProps) {
  const [textLabel, setTextLabel] = useState(link.textLabel);
  const [url, setUrl] = useState(link.url);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  useEffect(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    setSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [textLabel, url]);

  const handleAutoSave = async () => {
    if (textLabel === link.textLabel && url === link.url) {
      return;
    }

    if (!textLabel.trim() || !url.trim()) {
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Ungültige URL');
      return;
    }

    try {
      await updateLink.mutateAsync({
        id: link.id,
        textLabel,
        url,
        visible: link.visible,
        order: link.order,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleManualSave = async () => {
    if (!textLabel.trim()) {
      toast.error('Button-Text darf nicht leer sein');
      return;
    }

    if (!url.trim()) {
      toast.error('URL darf nicht leer sein');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Bitte geben Sie eine gültige URL ein');
      return;
    }

    try {
      await updateLink.mutateAsync({
        id: link.id,
        textLabel,
        url,
        visible: link.visible,
        order: link.order,
      });
      toast.success('Link erfolgreich gespeichert');
      setLastSaved(new Date());
      if (onSave) onSave();
    } catch (error) {
      toast.error('Fehler beim Speichern des Links');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLink.mutateAsync(link.id);
      toast.success('Link erfolgreich gelöscht');
      setDeleteDialogOpen(false);
      if (onSave) onSave();
    } catch (error) {
      toast.error('Fehler beim Löschen des Links');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setTextLabel(link.textLabel);
    setUrl(link.url);
    if (onCancel) onCancel();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Link bearbeiten</CardTitle>
          <CardDescription>
            Alle Änderungen werden automatisch nach 2 Sekunden Inaktivität gespeichert und sind sofort live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="textLabel">Button-Text</Label>
            <Input
              id="textLabel"
              value={textLabel}
              onChange={(e) => setTextLabel(e.target.value)}
              placeholder="z.B. Besuchen Sie unsere Website"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Zuletzt gespeichert: {lastSaved.toLocaleTimeString('de-DE')}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleManualSave} disabled={updateLink.isPending}>
              {updateLink.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Jetzt speichern
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteLink.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Link wird dauerhaft entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
