import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useAddMeetingSlot, useGetAllAppointments, useGetAllMeetingSlots } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Plus, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function MeetingManagement() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  
  const addMeetingSlot = useAddMeetingSlot();
  const { data: appointments, isLoading: appointmentsLoading } = useGetAllAppointments();
  const { data: allSlots, isLoading: slotsLoading } = useGetAllMeetingSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      toast.error('Bitte wählen Sie Datum und Uhrzeit');
      return;
    }

    try {
      const dateTime = new Date(`${date}T${time}`);
      const timestamp = BigInt(dateTime.getTime() * 1_000_000);
      
      await addMeetingSlot.mutateAsync({ 
        startTime: timestamp, 
        durationMinutes: BigInt(duration),
        description 
      });
      toast.success('Termin erfolgreich hinzugefügt!');
      setDate('');
      setTime('');
      setDuration('60');
      setDescription('');
    } catch (error) {
      toast.error('Termin konnte nicht hinzugefügt werden');
      console.error(error);
    }
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('de-DE', { 
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Uhrzeit</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Dauer (Minuten)</Label>
          <Input
            id="duration"
            type="number"
            min="15"
            step="15"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Zusätzliche Informationen zum Termin"
            rows={3}
          />
        </div>

        <Button type="submit" disabled={addMeetingSlot.isPending} className="w-full">
          {addMeetingSlot.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird hinzugefügt...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Termin hinzufügen
            </>
          )}
        </Button>
      </form>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Alle Termine ({allSlots?.length || 0})</h3>
        {slotsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : allSlots && allSlots.length > 0 ? (
          <div className="space-y-3">
            {allSlots.map((slot) => (
              <Card key={slot.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{formatDateTime(slot.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {Number(slot.durationMinutes)} Minuten
                      </div>
                      {slot.description && (
                        <p className="text-sm text-muted-foreground mt-2">{slot.description}</p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      slot.isBooked 
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {slot.isBooked ? 'Gebucht' : 'Verfügbar'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Noch keine Termine</p>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Buchungen ({appointments?.length || 0})</h3>
        {appointmentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const slot = allSlots?.find(s => s.id === appointment.timeSlotId);
              return (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="font-medium">{appointment.customerName}</div>
                    {slot && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(slot.startTime)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Noch keine Buchungen</p>
        )}
      </div>
    </div>
  );
}
