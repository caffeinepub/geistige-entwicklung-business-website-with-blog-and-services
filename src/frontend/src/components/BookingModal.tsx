import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useBookAppointment } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { MeetingSlot } from '../backend';

interface BookingModalProps {
  slot: MeetingSlot;
  onClose: () => void;
}

export default function BookingModal({ slot, onClose }: BookingModalProps) {
  const [customerName, setCustomerName] = useState('');
  const bookAppointment = useBookAppointment();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast.error('Bitte geben Sie Ihren Namen ein');
      return;
    }

    try {
      await bookAppointment.mutateAsync({
        customerName: customerName.trim(),
        timeSlotId: slot.id,
      });
      
      toast.success('Termin erfolgreich gebucht!', {
        description: 'Sie erhalten in Kürze eine Bestätigung.',
      });
      
      onClose();
    } catch (error) {
      toast.error('Termin konnte nicht gebucht werden', {
        description: error instanceof Error ? error.message : 'Bitte versuchen Sie es später erneut.',
      });
    }
  };

  const { date, time } = formatDateTime(slot.startTime);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Termin buchen</DialogTitle>
          <DialogDescription>
            Füllen Sie Ihre Daten aus, um die Buchung zu bestätigen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>{time} ({Number(slot.durationMinutes)} Minuten)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ihr Name *</Label>
              <Input
                id="name"
                placeholder="Geben Sie Ihren vollständigen Namen ein"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={bookAppointment.isPending}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={bookAppointment.isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={bookAppointment.isPending}>
                {bookAppointment.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Buchung bestätigen
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
