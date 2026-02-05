import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useUpdateStoreItem } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Save, X, CheckCircle2 } from 'lucide-react';
import type { StoreItem } from '../backend';

interface InlineEditEBookProps {
  storeItem: StoreItem;
  onCancel: () => void;
  onSave: () => void;
}

export default function InlineEditEBook({ storeItem, onCancel, onSave }: InlineEditEBookProps) {
  const [title, setTitle] = useState(storeItem.title);
  const [description, setDescription] = useState(storeItem.description);
  const [price, setPrice] = useState((Number(storeItem.price) / 100).toString());
  const [available, setAvailable] = useState(storeItem.available);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateStoreItem = useUpdateStoreItem();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, description, price, available]);

  const handleAutoSave = async () => {
    if (!title.trim() || !description.trim() || !price) {
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents < 0) {
      return;
    }

    try {
      await updateStoreItem.mutateAsync({
        id: storeItem.id,
        title,
        description,
        price: BigInt(priceInCents),
        coverImage: storeItem.coverImage,
        productType: storeItem.productType,
        available,
        previewImages: storeItem.previewImages,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleManualSave = async () => {
    if (!title.trim() || !description.trim() || !price) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents < 0) {
      toast.error('Ungültiger Preis');
      return;
    }

    try {
      await updateStoreItem.mutateAsync({
        id: storeItem.id,
        title,
        description,
        price: BigInt(priceInCents),
        coverImage: storeItem.coverImage,
        productType: storeItem.productType,
        available,
        previewImages: storeItem.previewImages,
      });
      toast.success('Store Item erfolgreich aktualisiert');
      setLastSaved(new Date());
      onSave();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Store Items');
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
          placeholder="Produkttitel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Beschreibung</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Produktbeschreibung"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-price">Preis (EUR)</Label>
        <Input
          id="edit-price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="edit-available"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="edit-available" className="cursor-pointer">
          Verfügbar für Kunden
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleManualSave} disabled={updateStoreItem.isPending} className="flex-1">
          {updateStoreItem.isPending ? (
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
      </div>
    </div>
  );
}
