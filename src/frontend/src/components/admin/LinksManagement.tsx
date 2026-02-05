import { useState } from 'react';
import { 
  useGetAllLinks, 
  useAddLink, 
  useUpdateLink,
  useDeleteLink,
  useReorderLinks
} from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export default function LinksManagement() {
  const { data: links, isLoading } = useGetAllLinks();
  const addLink = useAddLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const reorderLinks = useReorderLinks();

  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const handleAddLink = async () => {
    if (!newLinkLabel.trim()) {
      toast.error('Bitte geben Sie einen Button-Text ein');
      return;
    }

    if (!newLinkUrl.trim()) {
      toast.error('Bitte geben Sie eine URL ein');
      return;
    }

    // Validate URL format
    try {
      new URL(newLinkUrl);
    } catch {
      toast.error('Bitte geben Sie eine gültige URL ein (z.B. https://example.com)');
      return;
    }

    try {
      await addLink.mutateAsync({
        textLabel: newLinkLabel,
        url: newLinkUrl,
        order: BigInt(links?.length || 0),
      });
      toast.success('Link erfolgreich hinzugefügt');
      setNewLinkLabel('');
      setNewLinkUrl('');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Links');
      console.error(error);
    }
  };

  const handleDeleteLink = async () => {
    if (!linkToDelete) return;

    try {
      await deleteLink.mutateAsync(linkToDelete);
      toast.success('Link erfolgreich gelöscht');
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
    } catch (error) {
      toast.error('Fehler beim Löschen des Links');
      console.error(error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!links || index === 0) return;

    const newOrder = [...links];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    try {
      await reorderLinks.mutateAsync(newOrder.map(l => l.id));
      toast.success('Reihenfolge aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Ändern der Reihenfolge');
      console.error(error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!links || index === links.length - 1) return;

    const newOrder = [...links];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    try {
      await reorderLinks.mutateAsync(newOrder.map(l => l.id));
      toast.success('Reihenfolge aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Ändern der Reihenfolge');
      console.error(error);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    const link = links?.find(l => l.id === id);
    if (!link) return;

    try {
      await updateLink.mutateAsync({ 
        id, 
        textLabel: link.textLabel,
        url: link.url,
        visible: !currentVisibility,
        order: link.order
      });
      toast.success(currentVisibility ? 'Link ausgeblendet' : 'Link eingeblendet');
    } catch (error) {
      toast.error('Fehler beim Ändern der Sichtbarkeit');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Link hinzufügen</CardTitle>
          <CardDescription>
            Erstellen Sie einen neuen Button mit externem Link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-label">Button-Text</Label>
            <Input
              id="link-label"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="z.B. Besuchen Sie unsere Website"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <Button onClick={handleAddLink} disabled={addLink.isPending}>
            {addLink.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird hinzugefügt...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Link hinzufügen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bestehende Links</CardTitle>
          <CardDescription>
            Verwalten Sie die Reihenfolge und Sichtbarkeit Ihrer Link-Buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links && links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link, index) => (
                <Card key={link.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{link.textLabel}</h4>
                        </div>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{link.url}</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleVisibility(link.id, link.visible)}
                          title={link.visible ? 'Ausblenden' : 'Einblenden'}
                        >
                          {link.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>

                        <div className="flex flex-col gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === links.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setLinkToDelete(link.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Noch keine Links konfiguriert. Fügen Sie oben einen neuen Link hinzu.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Link wird dauerhaft entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLinkToDelete(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
