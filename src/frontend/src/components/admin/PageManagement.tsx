import { useState } from 'react';
import { 
  useGetHomepageSections, 
  useAddHomepageSection, 
  useUpdateHomepageSection,
  useDeleteHomepageSection,
  useReorderHomepageSections,
  useToggleSectionVisibility 
} from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { HomepageSection, SectionType } from '../../backend';
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

export default function PageManagement() {
  const { data: sections, isLoading } = useGetHomepageSections();
  const addSection = useAddHomepageSection();
  const updateSection = useUpdateHomepageSection();
  const deleteSection = useDeleteHomepageSection();
  const reorderSections = useReorderHomepageSections();
  const toggleVisibility = useToggleSectionVisibility();

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [newSectionType, setNewSectionType] = useState<'blog' | 'storeItems' | 'meetings' | 'mp3Player' | 'livestream' | 'links' | 'custom'>('custom');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    const sectionType: SectionType = 
      newSectionType === 'blog' ? { __kind__: 'blog', blog: null } :
      newSectionType === 'storeItems' ? { __kind__: 'storeItems', storeItems: null } :
      newSectionType === 'meetings' ? { __kind__: 'meetings', meetings: null } :
      newSectionType === 'mp3Player' ? { __kind__: 'mp3Player', mp3Player: null } :
      newSectionType === 'livestream' ? { __kind__: 'livestream', livestream: null } :
      newSectionType === 'links' ? { __kind__: 'links', links: null } :
      { __kind__: 'custom', custom: newSectionTitle };

    const newSection: HomepageSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      description: newSectionDescription,
      sectionType,
      order: BigInt(sections?.length || 0),
      visible: true,
    };

    try {
      await addSection.mutateAsync(newSection);
      toast.success('Abschnitt erfolgreich hinzugefügt');
      setNewSectionTitle('');
      setNewSectionDescription('');
      setNewSectionType('custom');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Abschnitts');
      console.error(error);
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;

    try {
      await deleteSection.mutateAsync(sectionToDelete);
      toast.success('Abschnitt erfolgreich gelöscht');
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
    } catch (error) {
      toast.error('Fehler beim Löschen des Abschnitts');
      console.error(error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!sections || index === 0) return;

    const newOrder = [...sections];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    try {
      await reorderSections.mutateAsync(newOrder.map(s => s.id));
      toast.success('Reihenfolge aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Ändern der Reihenfolge');
      console.error(error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!sections || index === sections.length - 1) return;

    const newOrder = [...sections];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    try {
      await reorderSections.mutateAsync(newOrder.map(s => s.id));
      toast.success('Reihenfolge aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Ändern der Reihenfolge');
      console.error(error);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await toggleVisibility.mutateAsync({ id, visible: !currentVisibility });
      toast.success(currentVisibility ? 'Abschnitt ausgeblendet' : 'Abschnitt eingeblendet');
    } catch (error) {
      toast.error('Fehler beim Ändern der Sichtbarkeit');
      console.error(error);
    }
  };

  const getSectionTypeLabel = (sectionType: SectionType): string => {
    if ('blog' in sectionType) return 'Blog';
    if ('storeItems' in sectionType) return 'Store Items';
    if ('meetings' in sectionType) return 'Meetings';
    if ('mp3Player' in sectionType) return 'MP3-Player';
    if ('livestream' in sectionType) return 'Livestream';
    if ('links' in sectionType) return 'Links';
    if ('custom' in sectionType) return 'Benutzerdefiniert';
    return 'Unbekannt';
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
          <CardTitle>Neuen Abschnitt hinzufügen</CardTitle>
          <CardDescription>
            Erstellen Sie einen neuen Abschnitt für Ihre Homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-type">Abschnittstyp</Label>
            <Select value={newSectionType} onValueChange={(value: any) => setNewSectionType(value)}>
              <SelectTrigger id="section-type">
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="storeItems">Store Items</SelectItem>
                <SelectItem value="meetings">Meetings</SelectItem>
                <SelectItem value="mp3Player">MP3-Player</SelectItem>
                <SelectItem value="livestream">Livestream</SelectItem>
                <SelectItem value="links">Links</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-title">Titel</Label>
            <Input
              id="section-title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="z.B. Über uns"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description">Beschreibung</Label>
            <Textarea
              id="section-description"
              value={newSectionDescription}
              onChange={(e) => setNewSectionDescription(e.target.value)}
              placeholder="Beschreibung des Abschnitts"
              rows={3}
            />
          </div>

          <Button onClick={handleAddSection} disabled={addSection.isPending}>
            {addSection.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird hinzugefügt...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Abschnitt hinzufügen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bestehende Abschnitte</CardTitle>
          <CardDescription>
            Verwalten Sie die Reihenfolge und Sichtbarkeit Ihrer Homepage-Abschnitte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sections && sections.length > 0 ? (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <Card key={section.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{section.title}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {getSectionTypeLabel(section.sectionType)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {section.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleVisibility(section.id, section.visible)}
                          title={section.visible ? 'Ausblenden' : 'Einblenden'}
                        >
                          {section.visible ? (
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
                            disabled={index === sections.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setSectionToDelete(section.id);
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
                Noch keine Abschnitte konfiguriert. Fügen Sie oben einen neuen Abschnitt hinzu.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abschnitt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Abschnitt wird dauerhaft von Ihrer Homepage entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSectionToDelete(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
