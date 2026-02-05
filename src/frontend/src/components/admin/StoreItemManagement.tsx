import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useAddStoreItem, useGetAllStoreItems } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { ExternalBlob, ProductType } from '../../backend';

export default function StoreItemManagement() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState<'eBook' | 'clothing' | 'other'>('eBook');
  const [otherType, setOtherType] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);
  
  const addStoreItem = useAddStoreItem();
  const { data: storeItems, isLoading } = useGetAllStoreItems();

  const formatPrice = (priceInCents: bigint) => {
    const price = Number(priceInCents) / 100;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getProductTypeLabel = (pt: ProductType): string => {
    if ('eBook' in pt) return 'eBook';
    if ('clothing' in pt) return 'Kleidung';
    if ('other' in pt) return pt.other;
    return 'Produkt';
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPreviewImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !price || !coverImage) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus und laden Sie ein Titelbild hoch');
      return;
    }

    if (productType === 'other' && !otherType.trim()) {
      toast.error('Bitte geben Sie einen Produkttyp ein');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Bitte geben Sie einen gültigen Preis ein');
      return;
    }

    try {
      const imageBytes = await coverImage.arrayBuffer();
      const coverBlob = ExternalBlob.fromBytes(new Uint8Array(imageBytes));
      
      const previewBlobs: ExternalBlob[] = [];
      for (const file of previewImages) {
        const bytes = await file.arrayBuffer();
        previewBlobs.push(ExternalBlob.fromBytes(new Uint8Array(bytes)));
      }

      const pt: ProductType = 
        productType === 'eBook' ? { __kind__: 'eBook', eBook: null } :
        productType === 'clothing' ? { __kind__: 'clothing', clothing: null } :
        { __kind__: 'other', other: otherType };
      
      await addStoreItem.mutateAsync({
        title,
        description,
        price: BigInt(Math.round(priceNum * 100)),
        coverImage: coverBlob,
        productType: pt,
        previewImages: previewBlobs,
      });
      
      toast.success('Produkt erfolgreich hinzugefügt!');
      setTitle('');
      setDescription('');
      setPrice('');
      setProductType('eBook');
      setOtherType('');
      setCoverImage(null);
      setCoverPreview(null);
      setPreviewImages([]);
      setPreviewImageUrls([]);
    } catch (error) {
      toast.error('Produkt konnte nicht hinzugefügt werden');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-title">Titel *</Label>
          <Input
            id="item-title"
            placeholder="Geben Sie den Produkttitel ein"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-description">Beschreibung *</Label>
          <Textarea
            id="item-description"
            placeholder="Beschreiben Sie das Produkt"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-price">Preis (EUR) *</Label>
            <Input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="29,99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-type">Produkttyp *</Label>
            <Select value={productType} onValueChange={(value: any) => setProductType(value)}>
              <SelectTrigger id="product-type">
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eBook">eBook</SelectItem>
                <SelectItem value="clothing">Kleidung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {productType === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="other-type">Produkttyp angeben *</Label>
            <Input
              id="other-type"
              placeholder="z.B. Accessoire, Dekoration"
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cover-image">Titelbild *</Label>
          <div className="flex items-center gap-4">
            <Input
              id="cover-image"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="flex-1"
              required
            />
            {coverPreview && (
              <img src={coverPreview} alt="Vorschau des Titelbilds" className="h-20 w-16 object-cover rounded border" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preview-images">Vorschaubilder (optional)</Label>
          <Input
            id="preview-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePreviewImagesChange}
          />
          {previewImageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previewImageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`Vorschau ${index + 1}`} className="h-20 w-20 object-cover rounded border" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => removePreviewImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={addStoreItem.isPending} className="w-full">
          {addStoreItem.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird hinzugefügt...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Produkt hinzufügen
            </>
          )}
        </Button>
      </form>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Vorhandene Produkte ({storeItems?.length || 0})</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : storeItems && storeItems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {storeItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg flex gap-3">
                <img 
                  src={item.coverImage.getDirectURL()} 
                  alt={item.title}
                  className="h-24 w-18 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                      {getProductTypeLabel(item.productType)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  <p className="text-sm font-semibold text-primary mt-2">
                    {formatPrice(item.price)}
                  </p>
                  {item.previewImages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.previewImages.length} Vorschaubild{item.previewImages.length !== 1 ? 'er' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Noch keine Produkte</p>
        )}
      </div>
    </div>
  );
}
