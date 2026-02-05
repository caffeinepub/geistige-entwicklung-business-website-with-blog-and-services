import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useAddLivestream, useGetAllLivestreams, useUpdateLivestream, useDeleteLivestream } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Plus, Video, Eye, EyeOff, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import type { Livestream } from '../../backend';

interface EditFormState {
  id?: string;
  title?: string;
  description?: string;
  externalLink?: string;
  buttonLabel?: string;
  visible?: boolean;
  startDate?: string;
  startTime?: string;
}

export default function LivestreamManagement() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Zum Livestream');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const addLivestream = useAddLivestream();
  const { data: livestreams, isLoading } = useGetAllLivestreams();
  const updateLivestream = useUpdateLivestream();
  const deleteLivestream = useDeleteLivestream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !startDate || !startTime || !externalLink.trim() || !buttonLabel.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const dateTime = new Date(`${startDate}T${startTime}`);
      const timestamp = BigInt(dateTime.getTime() * 1000000);
      
      await addLivestream.mutateAsync({
        title,
        startTime: timestamp,
        externalLink,
        buttonLabel,
        description,
      });
      
      toast.success('Livestream erfolgreich hinzugefügt!');
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('');
      setExternalLink('');
      setButtonLabel('Zum Livestream');
    } catch (error) {
      toast.error('Livestream konnte nicht hinzugefügt werden');
      console.error(error);
    }
  };

  const handleToggleVisibility = async (livestream: Livestream) => {
    try {
      await updateLivestream.mutateAsync({
        id: livestream.id,
        title: livestream.title,
        startTime: livestream.startTime,
        externalLink: livestream.externalLink,
        buttonLabel: livestream.buttonLabel,
        description: livestream.description,
        visible: !livestream.visible,
      });
      toast.success(livestream.visible ? 'Livestream ausgeblendet' : 'Livestream eingeblendet');
    } catch (error) {
      toast.error('Fehler beim Ändern der Sichtbarkeit');
      console.error(error);
    }
  };

  const handleStartEdit = (livestream: Livestream) => {
    const date = new Date(Number(livestream.startTime) / 1000000);
    setEditingId(livestream.id);
    setEditForm({
      id: livestream.id,
      title: livestream.title,
      description: livestream.description,
      externalLink: livestream.externalLink,
      buttonLabel: livestream.buttonLabel,
      visible: livestream.visible,
      startDate: date.toISOString().split('T')[0],
      startTime: date.toTimeString().slice(0, 5),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.title || !editForm.description || !editForm.startDate || !editForm.startTime || !editForm.externalLink || !editForm.buttonLabel) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const dateTime = new Date(`${editForm.startDate}T${editForm.startTime}`);
      const timestamp = BigInt(dateTime.getTime() * 1000000);

      await updateLivestream.mutateAsync({
        id: editingId,
        title: editForm.title,
        startTime: timestamp,
        externalLink: editForm.externalLink,
        buttonLabel: editForm.buttonLabel,
        description: editForm.description,
        visible: editForm.visible ?? true,
      });

      toast.success('Livestream erfolgreich aktualisiert');
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Livestreams');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteLivestream.mutateAsync(deleteId);
      toast.success('Livestream erfolgreich gelöscht');
      setDeleteId(null);
    } catch (error) {
      toast.error('Fehler beim Löschen des Livestreams');
      console.error(error);
    }
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="livestream-title">Titel</Label>
          <Input
            id="livestream-title"
            placeholder="z.B. Wöchentliches Live-Event"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="livestream-description">Beschreibung</Label>
          <Textarea
            id="livestream-description"
            placeholder="Beschreiben Sie den Livestream"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Startdatum</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-time">Startzeit</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="external-link">Externer Link</Label>
          <Input
            id="external-link"
            type="url"
            placeholder="https://youtube.com/live/..."
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-label">Button-Text</Label>
          <Input
            id="button-label"
            placeholder="z.B. Zum Livestream"
            value={buttonLabel}
            onChange={(e) => setButtonLabel(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={addLivestream.isPending} className="w-full">
          {addLivestream.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird hinzugefügt...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Livestream hinzufügen
            </>
          )}
        </Button>
      </form>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Geplante Livestreams ({livestreams?.length || 0})</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : livestreams && livestreams.length > 0 ? (
          <div className="space-y-3">
            {livestreams.map((livestream) => (
              <Card key={livestream.id}>
                <CardContent className="p-4">
                  {editingId === livestream.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Titel</Label>
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Startdatum</Label>
                          <Input
                            type="date"
                            value={editForm.startDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Startzeit</Label>
                          <Input
                            type="time"
                            value={editForm.startTime || ''}
                            onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Externer Link</Label>
                        <Input
                          type="url"
                          value={editForm.externalLink || ''}
                          onChange={(e) => setEditForm({ ...editForm, externalLink: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button-Text</Label>
                        <Input
                          value={editForm.buttonLabel || ''}
                          onChange={(e) => setEditForm({ ...editForm, buttonLabel: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} disabled={updateLivestream.isPending} className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          Speichern
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                          <X className="mr-2 h-4 w-4" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{livestream.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {livestream.description}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            📅 {formatDateTime(livestream.startTime)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            🔗 {livestream.externalLink}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleVisibility(livestream)}
                          title={livestream.visible ? 'Ausblenden' : 'Einblenden'}
                        >
                          {livestream.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(livestream)}
                          title="Bearbeiten"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(livestream.id)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Noch keine Livestreams geplant</p>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
