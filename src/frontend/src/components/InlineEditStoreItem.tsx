import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useUpdateStoreItem } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Save, X, Loader2, CheckCircle2 } from 'lucide-react';
import type { StoreItem, ProductType } from '../backend';

interface InlineEditStoreItemProps {
  storeItem: StoreItem;
  onCancel: () => void;
  onSave: () => void;
}

export default function InlineEditStoreItem({ storeItem, onCancel, onSave }: InlineEditStoreItemProps) {
  const [title, setTitle] = useState(storeItem.title);
  const [description, setDescription] = useState(storeItem.description);
  const [price, setPrice] = useState(Number(storeItem.price) / 100);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateStoreItem = useUpdateStoreItem();

  useEffect(() => {
    const changed = 
      title !== storeItem.title || 
      description !== storeItem.description || 
      price !== Number(storeItem.price) / 100;
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
  }, [title, description, price]);

  const handleAutoSave = async () => {
    if (!hasChanges) return;

    try {
      await updateStoreItem.mutateAsync({
        id: storeItem.id,
        title,
        description,
        price: BigInt(Math.round(price * 100)),
        coverImage: storeItem.coverImage,
        productType: storeItem.productType,
        available: storeItem.available,
        previewImages: storeItem.previewImages,
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
      await updateStoreItem.mutateAsync({
        id: storeItem.id,
        title,
        description,
        price: BigInt(Math.round(price * 100)),
        coverImage: storeItem.coverImage,
        productType: storeItem.productType,
        available: storeItem.available,
        previewImages: storeItem.previewImages,
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

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getProductTypeLabel = (pt: ProductType): string => {
    if ('eBook' in pt) return 'eBook';
    if ('clothing' in pt) return 'Kleidung';
    if ('other' in pt) return pt.other;
    return 'Produkt';
  };

  return (
    <div className="space-y-4 p-6 bg-muted/30 rounded-lg border-2 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Produkt bearbeiten</h3>
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
            disabled={updateStoreItem.isPending || !hasChanges}
          >
            {updateStoreItem.isPending ? (
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
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
            <Label htmlFor="edit-price">Preis (EUR)</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Produkttyp</Label>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded">
              {getProductTypeLabel(storeItem.productType)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Beschreibung</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Produktbeschreibung"
              rows={6}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cover-Vorschau</Label>
            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <img
                src={storeItem.coverImage.getDirectURL()}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {storeItem.previewImages.length > 0 && (
            <div className="space-y-2">
              <Label>Vorschaubilder ({storeItem.previewImages.length})</Label>
              <div className="grid grid-cols-2 gap-2">
                {storeItem.previewImages.slice(0, 4).map((img, index) => (
                  <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
                    <img
                      src={img.getDirectURL()}
                      alt={`Vorschau ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-blue-500/5 p-3 rounded border border-blue-500/20">
        <strong>Live-Persistenz:</strong> Alle Änderungen werden automatisch nach 2 Sekunden direkt im Live-System gespeichert. 
        Kein Entwurfsmodus – Ihre Bearbeitungen sind sofort für alle sichtbar.
      </div>
    </div>
  );
}
