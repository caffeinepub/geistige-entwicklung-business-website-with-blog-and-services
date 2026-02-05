import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useUpdateBlogPost, useDeleteBlogPost, useAddBlogFile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Save, X, Loader2, CheckCircle2, Upload, Trash2, FileImage } from 'lucide-react';
import type { BlogPost } from '../backend';
import { ExternalBlob } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface InlineEditBlogPostProps {
  post: BlogPost;
  onCancel: () => void;
  onSave: () => void;
}

export default function InlineEditBlogPost({ post, onCancel, onSave }: InlineEditBlogPostProps) {
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const addBlogFile = useAddBlogFile();

  useEffect(() => {
    const changed = title !== post.title || excerpt !== post.excerpt || content !== post.content;
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
  }, [title, excerpt, content]);

  const handleAutoSave = async () => {
    if (!hasChanges) return;

    try {
      await updateBlogPost.mutateAsync({
        id: post.id,
        title,
        content,
        excerpt,
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
      await updateBlogPost.mutateAsync({
        id: post.id,
        title,
        content,
        excerpt,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        
        await addBlogFile.mutateAsync({ blogId: post.id, file: blob });
        
        // If it's an image, insert markdown into content
        if (file.type.startsWith('image/')) {
          const url = blob.getDirectURL();
          const imageMarkdown = `\n\n![${file.name}](${url})\n\n`;
          setContent(content + imageMarkdown);
        }
      }
      
      toast.success(`${files.length} Datei(en) hochgeladen und zum Beitrag hinzugefügt`);
    } catch (error) {
      toast.error('Fehler beim Hochladen der Dateien');
      console.error(error);
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBlogPost.mutateAsync(post.id);
      toast.success('Blogbeitrag erfolgreich gelöscht');
      onCancel();
    } catch (error) {
      toast.error('Fehler beim Löschen des Blogbeitrags');
      console.error(error);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <div className="space-y-4 p-6 bg-muted/30 rounded-lg border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Blogbeitrag bearbeiten</h3>
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
              disabled={updateBlogPost.isPending || !hasChanges}
            >
              {updateBlogPost.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Jetzt speichern
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteBlogPost.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Löschen
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Schließen
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titel</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel des Blogbeitrags"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-excerpt">Auszug</Label>
            <Textarea
              id="edit-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Kurze Zusammenfassung"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">Inhalt</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Vollständiger Inhalt"
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Dateien hinzufügen (Bilder, Dokumente, etc.)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                multiple
                onChange={handleFileUpload}
                disabled={uploadingFiles}
                className="flex-1"
              />
              {uploadingFiles && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileImage className="h-3 w-3" />
              Bilder werden automatisch in den Inhalt eingefügt. Alle Dateien werden dem Beitrag zugeordnet.
            </p>
          </div>

          {post.associatedFiles && post.associatedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Zugeordnete Dateien ({post.associatedFiles.length})</Label>
              <div className="text-xs text-muted-foreground bg-blue-500/5 p-2 rounded border border-blue-500/20">
                {post.associatedFiles.length} Datei(en) sind diesem Beitrag zugeordnet
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-blue-500/5 p-3 rounded border border-blue-500/20">
          <strong>Live-Persistenz:</strong> Alle Änderungen werden automatisch nach 2 Sekunden direkt im Live-System gespeichert. 
          Kein Entwurfsmodus – Ihre Bearbeitungen sind sofort für alle sichtbar.
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blogbeitrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Blogbeitrag <strong>"{post.title}"</strong> wirklich löschen?
              <br /><br />
              Diese Aktion kann nicht rückgängig gemacht werden. Der Beitrag und alle zugeordneten Dateien werden dauerhaft aus dem Live-System entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBlogPost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                'Löschen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
