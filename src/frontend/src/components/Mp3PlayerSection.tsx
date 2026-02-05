import { useState, useRef, useEffect } from 'react';
import { useGetPublicPlaylists, useGetMp3TracksByPlaylist, useTrackElementClick, useIncrementPlayCount, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Mp3Track } from '../backend';

interface Mp3PlayerSectionProps {
  customTitle?: string;
  customDescription?: string;
}

type LoopMode = 'none' | 'one' | 'all';

export default function Mp3PlayerSection({ customTitle, customDescription }: Mp3PlayerSectionProps) {
  const { data: playlists, isLoading: playlistsLoading } = useGetPublicPlaylists();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const { data: tracks, isLoading: tracksLoading } = useGetMp3TracksByPlaylist(selectedPlaylistId);
  const trackClick = useTrackElementClick();
  const incrementPlayCount = useIncrementPlayCount();
  const { data: isAdmin } = useIsCallerAdmin();

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (playlists && playlists.length > 0 && !selectedPlaylistId) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (loopMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (loopMode === 'all') {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [loopMode, tracks, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    setHasTrackedPlay(false);
  }, [currentTrackIndex]);

  const currentTrack = tracks && tracks[currentTrackIndex];

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      trackClick.mutate('mp3-play');

      if (!hasTrackedPlay && !isAdmin) {
        try {
          await incrementPlayCount.mutateAsync(currentTrack.id);
          setHasTrackedPlay(true);
        } catch (error) {
          console.error('Failed to track play count:', error);
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (!tracks || tracks.length === 0) return;
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleNext = () => {
    if (!tracks || tracks.length === 0) return;
    const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoopMode = () => {
    const modes: LoopMode[] = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(loopMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setLoopMode(modes[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (playlistsLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container">
          <Skeleton className="h-96 w-full" />
        </div>
      </section>
    );
  }

  if (!playlists || playlists.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {customTitle || 'MP3-Player'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {customDescription || 'Hören Sie unsere Musiksammlung'}
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Musik-Player</CardTitle>
              <Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Playlist wählen" />
                </SelectTrigger>
                <SelectContent>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {tracksLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : !tracks || tracks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Keine Tracks in dieser Playlist</p>
              </div>
            ) : (
              <>
                {/* Current Track Info */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{currentTrack?.title || 'Kein Track'}</h3>
                  <p className="text-sm text-muted-foreground">{currentTrack?.artist || ''}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLoopMode}
                    className={loopMode !== 'none' ? 'text-primary' : ''}
                  >
                    {loopMode === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={handlePrevious}>
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button size="icon" className="h-12 w-12" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={handleNext}>
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Track List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-muted-foreground">Playlist</h4>
                  {tracks.map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(index);
                        setIsPlaying(false);
                        setCurrentTime(0);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentTrackIndex
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <span className="text-sm text-muted-foreground ml-4">
                          {formatTime(Number(track.duration))}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Hidden Audio Element */}
                {currentTrack && (
                  <audio
                    ref={audioRef}
                    src={currentTrack.file.getDirectURL()}
                    onLoadedMetadata={() => {
                      if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                      }
                    }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

