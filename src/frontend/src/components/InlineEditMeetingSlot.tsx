import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useUpdateMeetingSlot } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Save, X, Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import type { MeetingSlot } from '../backend';

interface InlineEditMeetingSlotProps {
  slot: MeetingSlot;
  onCancel: () => void;
  onSave: () => void;
}

export default function InlineEditMeetingSlot({ slot, onCancel, onSave }: InlineEditMeetingSlotProps) {
  const [description, setDescription] = useState(slot.description);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateMeetingSlot = useUpdateMeetingSlot();

  useEffect(() => {
    const changed = description !== slot.description;
    setHasChanges(changed);

    if (changed && autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (changed) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [description]);

  const handleAutoSave = async () => {
    if (!hasChanges) return;

    try {
      await updateMeetingSlot.mutateAsync({
        id: slot.id,
        startTime: slot.startTime,
        durationMinutes: slot.durationMinutes,
        description,
      });
      setHasChanges(false);
      setLastSaved(new Date());
      toast.success('Live gespeichert', { duration: 1500 });
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error('Save failed:', error);
    }
  };

  const handleManualSave = async () => {
    try {
      await updateMeetingSlot.mutateAsync({
        id: slot.id,
        startTime: slot.startTime,
        durationMinutes: slot.durationMinutes,
        description,
      });
      setHasChanges(false);
      setLastSaved(new Date());
      toast.success('Änderungen live gespeichert');
      onSave();
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
    }
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return {
      date: date.toLocaleDateString('de-DE', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const { date, time } = formatDateTime(slot.startTime);

  return (
    <div className="space-y-4 p-6 bg-muted/30 rounded-lg border-2 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Termin bearbeiten</h3>
          {hasChanges ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Wird gespeichert...
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Live • {formatLastSaved()}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleManualSave}
            disabled={updateMeetingSlot.isPending || !hasChanges}
          >
            {updateMeetingSlot.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Jetzt speichern
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Schließen
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-background rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Datum</div>
              <div className="font-medium">{date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Uhrzeit & Dauer</div>
              <div className="font-medium">{time} ({Number(slot.durationMinutes)} Min.)</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Beschreibung</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Zusätzliche Informationen zum Termin"
            rows={4}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-blue-500/5 p-3 rounded border border-blue-500/20">
        <strong>Live-Persistenz:</strong> Alle Änderungen werden automatisch nach 2 Sekunden direkt im Live-System gespeichert. 
        Kein Entwurfsmodus – Ihre Bearbeitungen sind sofort für alle sichtbar.
      </div>
    </div>
  );
}
