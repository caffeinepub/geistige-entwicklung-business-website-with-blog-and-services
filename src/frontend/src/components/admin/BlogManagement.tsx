import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useCreateBlogPost, useGetAllBlogPosts, useDeleteBlogPost } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Plus, Upload, X, Trash2, Edit } from 'lucide-react';
import { ExternalBlob } from '../../backend';
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
import type { BlogPost } from '../../backend';

export default function BlogManagement() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  
  const createBlogPost = useCreateBlogPost();
  const { data: blogPosts, isLoading } = useGetAllBlogPosts();
  const deleteBlogPost = useDeleteBlogPost();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const newImageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        const url = blob.getDirectURL();
        newImageUrls.push(url);
      }
      
      setImageUrls([...imageUrls, ...newImageUrls]);
      toast.success(`${newImageUrls.length} Bild(er) hochgeladen`);
    } catch (error) {
      toast.error('Fehler beim Hochladen der Bilder');
      console.error(error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleInsertImage = (url: string) => {
    const imageMarkdown = `\n\n![Bild](${url})\n\n`;
    setContent(content + imageMarkdown);
    toast.success('Bild in den Inhalt eingefügt');
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      await createBlogPost.mutateAsync({ title, content, excerpt });
      toast.success('Blogbeitrag erfolgreich erstellt!');
      setTitle('');
      setContent('');
      setExcerpt('');
      setImageUrls([]);
    } catch (error) {
      toast.error('Blogbeitrag konnte nicht erstellt werden');
      console.error(error);
    }
  };

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await deleteBlogPost.mutateAsync(postToDelete.id);
      toast.success('Blogbeitrag erfolgreich gelöscht');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      toast.error('Fehler beim Löschen des Blogbeitrags');
      console.error(error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              placeholder="Geben Sie den Titel des Blogbeitrags ein"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Auszug</Label>
            <Textarea
              id="excerpt"
              placeholder="Kurze Zusammenfassung des Blogbeitrags"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Bilder hochladen</Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="flex-1"
              />
              {uploadingImages && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleInsertImage(url)}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Einfügen
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Inhalt</Label>
            <Textarea
              id="content"
              placeholder="Vollständiger Inhalt des Blogbeitrags (Markdown unterstützt)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              Tipp: Verwenden Sie Markdown-Syntax für Formatierung. Bilder werden als ![Bild](URL) eingefügt.
            </p>
          </div>

          <Button type="submit" disabled={createBlogPost.isPending} className="w-full">
            {createBlogPost.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Blogbeitrag erstellen
              </>
            )}
          </Button>
        </form>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Vorhandene Blogbeiträge ({blogPosts?.length || 0})</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : blogPosts && blogPosts.length > 0 ? (
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{post.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(post.publicationDate) / 1000000).toLocaleDateString('de-DE')}
                      </p>
                      {post.associatedFiles && post.associatedFiles.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {post.associatedFiles.length} Datei(en)
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(post)}
                    disabled={deleteBlogPost.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Noch keine Blogbeiträge</p>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blogbeitrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Blogbeitrag <strong>"{postToDelete?.title}"</strong> wirklich löschen?
              <br /><br />
              Diese Aktion kann nicht rückgängig gemacht werden. Der Beitrag und alle zugeordneten Dateien werden dauerhaft aus dem Live-System entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
