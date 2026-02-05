import { useGetAllStoreItems, useIsCallerAdmin, useTrackElementClick } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ShoppingBag, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import EditableSection from './EditableSection';
import type { SiteContent, ProductType } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useState } from 'react';

interface StoreItemSectionProps {
  siteContent?: SiteContent;
  customTitle?: string;
  customDescription?: string;
}

export default function StoreItemSection({ siteContent, customTitle, customDescription }: StoreItemSectionProps) {
  const { data: storeItems, isLoading } = useGetAllStoreItems();
  const { data: isAdmin } = useIsCallerAdmin();
  const trackClick = useTrackElementClick();
  const [previewImages, setPreviewImages] = useState<string[] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const title = customTitle || siteContent?.storeItemsTitle || 'Store Items';
  const description = customDescription || siteContent?.storeItemsDescription || 'Entdecken Sie unsere Produkte.';

  const handleItemClick = (itemId: string) => {
    trackClick.mutate(`storeItem-${itemId}`);
  };

  const handlePreviewClick = (images: string[]) => {
    setPreviewImages(images);
    setPreviewOpen(true);
  };

  const getProductTypeLabel = (productType: ProductType): string => {
    if ('eBook' in productType) return 'eBook';
    if ('clothing' in productType) return 'Kleidung';
    if ('other' in productType) return productType.other;
    return 'Produkt';
  };

  return (
    <section id="store-items" className="py-16">
      <div className="container">
        <EditableSection
          title={title}
          description={description}
          contentKey="storeItems"
          isAdmin={!!isAdmin}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : storeItems && storeItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {storeItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-[3/4] relative bg-muted">
                  <img
                    src={item.coverImage.getDirectURL()}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                  {item.previewImages.length > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => handlePreviewClick(item.previewImages.map(img => img.getDirectURL()))}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Vorschau
                    </Button>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap ml-2">
                      {getProductTypeLabel(item.productType)}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {(Number(item.price) / 100).toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                    <Button onClick={() => handleItemClick(item.id)}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Kaufen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Noch keine Produkte verfügbar.</p>
          </div>
        )}
      </div>

      {/* Preview Images Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Produktvorschau</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {previewImages?.map((imgUrl, index) => (
              <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={imgUrl}
                  alt={`Vorschau ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
