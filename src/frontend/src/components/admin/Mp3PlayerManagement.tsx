import { useState } from 'react';
import {
  useGetAllPlaylists,
  useGetAllMp3Tracks,
  useCreatePlaylist,
  useUploadMp3Track,
  useToggleMp3TrackVisibility,
  useTogglePlaylistVisibility,
  useDeleteMp3Track,
  useReorderMp3Tracks,
} from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Eye, EyeOff, Music, CheckCircle2, Trash2, GripVertical, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
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

export default function Mp3PlayerManagement() {
  const { data: playlists, isLoading: playlistsLoading } = useGetAllPlaylists();
  const { data: tracks, isLoading: tracksLoading } = useGetAllMp3Tracks();
  const createPlaylist = useCreatePlaylist();
  const uploadTrack = useUploadMp3Track();
  const toggleTrackVisibility = useToggleMp3TrackVisibility();
  const togglePlaylistVisibility = useTogglePlaylistVisibility();
  const deleteMp3Track = useDeleteMp3Track();
  const reorderTracks = useReorderMp3Tracks();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Bitte geben Sie einen Playlist-Namen ein');
      return;
    }

    try {
      await createPlaylist.mutateAsync(newPlaylistName);
      toast.success('Playlist erfolgreich im Live-System erstellt');
      setNewPlaylistName('');
    } catch (error) {
      toast.error('Fehler beim Erstellen der Playlist');
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Bitte wählen Sie eine Audio-Datei');
      return;
    }

    if (!newTrackTitle.trim() || !newTrackArtist.trim() || !selectedPlaylistId) {
      toast.error('Bitte füllen Sie alle Felder aus und wählen Sie eine Playlist');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;

      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });

      const duration = Math.floor(audio.duration);
      URL.revokeObjectURL(objectUrl);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const playlistTracks = tracks?.filter(t => t.playlistId === selectedPlaylistId) || [];
      const maxOrder = playlistTracks.length > 0 
        ? Math.max(...playlistTracks.map(t => Number(t.order))) 
        : -1;

      await uploadTrack.mutateAsync({
        title: newTrackTitle,
        artist: newTrackArtist,
        duration: BigInt(duration),
        file: blob,
        playlistId: selectedPlaylistId,
        order: BigInt(maxOrder + 1),
      });

      toast.success('Track erfolgreich im Live-System hochgeladen');
      setNewTrackTitle('');
      setNewTrackArtist('');
      setUploadProgress(0);
      e.target.value = '';
    } catch (error) {
      toast.error('Fehler beim Hochladen des Tracks');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleTrackVisibility = async (trackId: string, currentVisibility: boolean) => {
    try {
      await toggleTrackVisibility.mutateAsync({ id: trackId, visible: !currentVisibility });
      toast.success(currentVisibility ? 'Track ausgeblendet (Live)' : 'Track eingeblendet (Live)');
    } catch (error) {
      toast.error('Fehler beim Ändern der Sichtbarkeit');
      console.error(error);
    }
  };

  const handleTogglePlaylistVisibility = async (playlistId: string, currentVisibility: boolean) => {
    try {
      await togglePlaylistVisibility.mutateAsync({ id: playlistId, visible: !currentVisibility });
      toast.success(currentVisibility ? 'Playlist ausgeblendet (Live)' : 'Playlist eingeblendet (Live)');
    } catch (error) {
      toast.error('Fehler beim Ändern der Sichtbarkeit');
      console.error(error);
    }
  };

  const handleDeleteTrack = async () => {
    if (!trackToDelete) return;

    try {
      await deleteMp3Track.mutateAsync(trackToDelete);
      toast.success('Track erfolgreich gelöscht (Live)');
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    } catch (error) {
      toast.error('Fehler beim Löschen des Tracks');
      console.error(error);
    }
  };

  const handleMoveTrack = async (playlistId: string, trackId: string, direction: 'up' | 'down') => {
    const playlistTracks = tracks?.filter(t => t.playlistId === playlistId).sort((a, b) => Number(a.order) - Number(b.order)) || [];
    const currentIndex = playlistTracks.findIndex(t => t.id === trackId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === playlistTracks.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newOrder = [...playlistTracks];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    try {
      await reorderTracks.mutateAsync({
        playlistId,
        newOrder: newOrder.map(t => t.id),
      });
      toast.success('Reihenfolge aktualisiert (Live)');
    } catch (error) {
      toast.error('Fehler beim Ändern der Reihenfolge');
      console.error(error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (playlistsLoading || tracksLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Live-Persistenz aktiviert</h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Alle Uploads, Playlists und Änderungen werden sofort im Live-System gespeichert. 
              Es gibt keinen Entwurfsmodus – Ihre Änderungen sind unmittelbar für alle Besucher sichtbar.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neue Playlist erstellen</CardTitle>
          <CardDescription>Erstellen Sie eine neue Playlist für Ihre MP3-Tracks (Live-Speicherung)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Playlist-Name</Label>
            <Input
              id="playlist-name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="z.B. Entspannungsmusik"
            />
          </div>
          <Button onClick={handleCreatePlaylist} disabled={createPlaylist.isPending}>
            {createPlaylist.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Playlist erstellen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MP3-Track hochladen</CardTitle>
          <CardDescription>Laden Sie einen neuen Track zu einer Playlist hoch (Live-Upload)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-playlist">Playlist</Label>
            <Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
              <SelectTrigger id="track-playlist">
                <SelectValue placeholder="Playlist auswählen" />
              </SelectTrigger>
              <SelectContent>
                {playlists?.map((playlist) => (
                  <SelectItem key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="track-title">Track-Titel</Label>
            <Input
              id="track-title"
              value={newTrackTitle}
              onChange={(e) => setNewTrackTitle(e.target.value)}
              placeholder="z.B. Entspannende Melodie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track-artist">Künstler</Label>
            <Input
              id="track-artist"
              value={newTrackArtist}
              onChange={(e) => setNewTrackArtist(e.target.value)}
              placeholder="z.B. Max Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track-file">MP3-Datei</Label>
            <Input
              id="track-file"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload-Fortschritt (Live-System)</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Playlists</CardTitle>
          <CardDescription>Verwalten Sie Ihre Playlists und Tracks (Live-Änderungen)</CardDescription>
        </CardHeader>
        <CardContent>
          {playlists && playlists.length > 0 ? (
            <div className="space-y-6">
              {playlists.map((playlist) => {
                const playlistTracks = tracks?.filter((t) => t.playlistId === playlist.id).sort((a, b) => Number(a.order) - Number(b.order)) || [];
                return (
                  <Card key={playlist.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Music className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold">{playlist.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {playlistTracks.length} Track{playlistTracks.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTogglePlaylistVisibility(playlist.id, playlist.visible)}
                          title={playlist.visible ? 'Ausblenden' : 'Einblenden'}
                        >
                          {playlist.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>

                      {playlistTracks.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {playlistTracks.map((track, index) => (
                            <div key={track.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5"
                                  onClick={() => handleMoveTrack(playlist.id, track.id, 'up')}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5"
                                  onClick={() => handleMoveTrack(playlist.id, track.id, 'down')}
                                  disabled={index === playlistTracks.length - 1}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{track.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="truncate">{track.artist}</span>
                                  <span>•</span>
                                  <span>{formatDuration(Number(track.duration))}</span>
                                  {Number(track.playCount) > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1" title="Besucheraufrufe">
                                        <BarChart3 className="h-3 w-3" />
                                        {Number(track.playCount)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleToggleTrackVisibility(track.id, track.visible)}
                                  title={track.visible ? 'Ausblenden' : 'Einblenden'}
                                >
                                  {track.visible ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setTrackToDelete(track.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  title="Löschen"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Noch keine Playlists erstellt</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Track löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Track wird dauerhaft aus dem Live-System entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTrackToDelete(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrack}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

