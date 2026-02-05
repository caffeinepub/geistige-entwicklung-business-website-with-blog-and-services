import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useUpdateLivestream, useDeleteLivestream } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Save, X, Trash2, CheckCircle2 } from 'lucide-react';
import type { Livestream } from '../backend';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface InlineEditLivestreamProps {
  livestream: Livestream;
  onCancel: () => void;
  onSave: () => void;
}

export default function InlineEditLivestream({ livestream, onCancel, onSave }: InlineEditLivestreamProps) {
  const [title, setTitle] = useState(livestream.title);
  const [description, setDescription] = useState(livestream.description);
  const [externalLink, setExternalLink] = useState(livestream.externalLink);
  const [buttonLabel, setButtonLabel] = useState(livestream.buttonLabel);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [visible, setVisible] = useState(livestream.visible);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateLivestream = useUpdateLivestream();
  const deleteLivestream = useDeleteLivestream();

  useEffect(() => {
    const date = new Date(Number(livestream.startTime) / 1000000);
    setStartDate(date.toISOString().split('T')[0]);
    setStartTime(date.toTimeString().slice(0, 5));
  }, [livestream.startTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, description, externalLink, buttonLabel, startDate, startTime, visible]);

  const handleAutoSave = async () => {
    if (!title.trim() || !description.trim() || !externalLink.trim() || !buttonLabel.trim() || !startDate || !startTime) {
      return;
    }

    try {
      const dateTime = new Date(`${startDate}T${startTime}`);
      const timestamp = BigInt(dateTime.getTime() * 1000000);

      await updateLivestream.mutateAsync({
        id: livestream.id,
        title,
        startTime: timestamp,
        externalLink,
        buttonLabel,
        description,
        visible,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleManualSave = async () => {
    if (!title.trim() || !description.trim() || !externalLink.trim() || !buttonLabel.trim() || !startDate || !startTime) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const dateTime = new Date(`${startDate}T${startTime}`);
      const timestamp = BigInt(dateTime.getTime() * 1000000);

      await updateLivestream.mutateAsync({
        id: livestream.id,
        title,
        startTime: timestamp,
        externalLink,
        buttonLabel,
        description,
        visible,
      });
      toast.success('Livestream erfolgreich aktualisiert');
      setLastSaved(new Date());
      onSave();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Livestreams');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLivestream.mutateAsync(livestream.id);
      toast.success('Livestream erfolgreich gelöscht');
      onSave();
    } catch (error) {
      toast.error('Fehler beim Löschen des Livestreams');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Live-Bearbeitung aktiv
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Alle Änderungen werden automatisch nach 2 Sekunden Inaktivität direkt im Live-System gespeichert.
              {lastSaved && (
                <span className="block mt-1">
                  Zuletzt gespeichert: {lastSaved.toLocaleTimeString('de-DE')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-title">Titel</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Livestream-Titel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Beschreibung</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung des Livestreams"
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-start-date">Startdatum</Label>
          <Input
            id="edit-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-start-time">Startzeit</Label>
          <Input
            id="edit-start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-external-link">Externer Link</Label>
        <Input
          id="edit-external-link"
          type="url"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          placeholder="https://youtube.com/live/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-button-label">Button-Text</Label>
        <Input
          id="edit-button-label"
          value={buttonLabel}
          onChange={(e) => setButtonLabel(e.target.value)}
          placeholder="z.B. Zum Livestream"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="edit-visible"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="edit-visible" className="cursor-pointer">
          Sichtbar für Besucher
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleManualSave} disabled={updateLivestream.isPending} className="flex-1">
          {updateLivestream.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Speichern & Schließen
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="mr-2 h-4 w-4" />
          Abbrechen
        </Button>
        <Button onClick={() => setShowDeleteDialog(true)} variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Löschen
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Livestream löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Livestream löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
