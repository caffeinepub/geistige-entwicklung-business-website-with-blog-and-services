import { useState } from 'react';
import { useGetAvailableMeetingSlots, useIsCallerAdmin, useTrackElementClick } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import BookingModal from './BookingModal';
import EditableSection from './EditableSection';
import type { MeetingSlot, SiteContent } from '../backend';

interface MeetingSectionProps {
  siteContent?: SiteContent;
  customTitle?: string;
  customDescription?: string;
}

export default function MeetingSection({ siteContent, customTitle, customDescription }: MeetingSectionProps) {
  const { data: slots, isLoading } = useGetAvailableMeetingSlots();
  const { data: isAdmin } = useIsCallerAdmin();
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);
  const trackClick = useTrackElementClick();

  const title = customTitle || siteContent?.meetingTitle || '1-on-1 Meetings';
  const description = customDescription || siteContent?.meetingDescription || 'Buchen Sie persönliche Beratungsgespräche.';

  const handleSlotClick = (slot: MeetingSlot) => {
    trackClick.mutate(`meeting-slot-${slot.id}`);
    setSelectedSlot(slot);
  };

  return (
    <section id="meetings" className="py-16 bg-muted/50">
      <div className="container">
        <EditableSection
          title={title}
          description={description}
          contentKey="meeting"
          isAdmin={!!isAdmin}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : slots && slots.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <Card key={slot.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(Number(slot.startTime) / 1000000).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(Number(slot.startTime) / 1000000).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ({Number(slot.durationMinutes)} Min.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{slot.description}</p>
                  <Button className="w-full" onClick={() => handleSlotClick(slot)}>
                    Termin buchen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Derzeit keine freien Termine verfügbar.</p>
          </div>
        )}
      </div>

      {selectedSlot && (
        <BookingModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}
    </section>
  );
}
