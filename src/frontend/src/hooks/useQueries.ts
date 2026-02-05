import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BlogPost, StoreItem, MeetingSlot, Appointment, UserProfile, SiteContent, HomepageSection, AnalyticsData, Mp3Track, Playlist, Livestream, ProductType, LinkItem } from '../backend';
import { ExternalBlob } from '../backend';

// Blog Post Queries
export function useGetAllBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBlogPost(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost | null>({
    queryKey: ['blogPost', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBlogPost(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, excerpt }: { title: string; content: string; excerpt: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBlogPost(title, content, excerpt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, content, excerpt }: { id: string; title: string; content: string; excerpt: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBlogPost(id, title, content, excerpt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useUpdateBlogExcerpt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, excerpt }: { id: string; excerpt: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateExcerpt(id, excerpt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useAddBlogFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blogId, file }: { blogId: string; file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBlogFile(blogId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

// Store Item Queries
export function useGetAllStoreItems() {
  const { actor, isFetching } = useActor();

  return useQuery<StoreItem[]>({
    queryKey: ['storeItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStoreItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStoreItem(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StoreItem | null>({
    queryKey: ['storeItem', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStoreItem(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddStoreItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      price, 
      coverImage,
      productType,
      previewImages
    }: { 
      title: string; 
      description: string; 
      price: bigint; 
      coverImage: ExternalBlob;
      productType: ProductType;
      previewImages: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStoreItem(title, description, price, coverImage, productType, previewImages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeItems'] });
    },
  });
}

export function useUpdateStoreItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      description, 
      price, 
      coverImage,
      productType,
      available,
      previewImages
    }: { 
      id: string;
      title: string; 
      description: string; 
      price: bigint; 
      coverImage: ExternalBlob;
      productType: ProductType;
      available: boolean;
      previewImages: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStoreItem(id, title, description, price, coverImage, productType, available, previewImages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeItems'] });
    },
  });
}

// Meeting Slot Queries
export function useGetAvailableMeetingSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<MeetingSlot[]>({
    queryKey: ['meetingSlots'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableMeetingSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMeetingSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<MeetingSlot[]>({
    queryKey: ['allMeetingSlots'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMeetingSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMeetingSlot(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MeetingSlot | null>({
    queryKey: ['meetingSlot', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMeetingSlot(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddMeetingSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ startTime, durationMinutes, description }: { startTime: bigint; durationMinutes: bigint; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMeetingSlot(startTime, durationMinutes, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetingSlots'] });
      queryClient.invalidateQueries({ queryKey: ['allMeetingSlots'] });
    },
  });
}

export function useUpdateMeetingSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, startTime, durationMinutes, description }: { id: string; startTime: bigint; durationMinutes: bigint; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMeetingSlot(id, startTime, durationMinutes, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetingSlots'] });
      queryClient.invalidateQueries({ queryKey: ['allMeetingSlots'] });
    },
  });
}

// Appointment Mutations
export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerName, timeSlotId }: { customerName: string; timeSlotId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookAppointment(customerName, timeSlotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetingSlots'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
    },
  });
}

export function useGetMyAppointments() {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAppointments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllAppointments() {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['allAppointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAppointments();
    },
    enabled: !!actor && !isFetching,
  });
}

// Livestream Queries
export function useGetAllLivestreams() {
  const { actor, isFetching } = useActor();

  return useQuery<Livestream[]>({
    queryKey: ['livestreams'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLivestreams();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLivestream(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Livestream | null>({
    queryKey: ['livestream', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLivestream(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddLivestream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      startTime, 
      externalLink, 
      buttonLabel, 
      description 
    }: { 
      title: string; 
      startTime: bigint; 
      externalLink: string; 
      buttonLabel: string; 
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLivestream(title, startTime, externalLink, buttonLabel, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestreams'] });
    },
  });
}

export function useUpdateLivestream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      startTime, 
      externalLink, 
      buttonLabel, 
      description, 
      visible 
    }: { 
      id: string;
      title: string; 
      startTime: bigint; 
      externalLink: string; 
      buttonLabel: string; 
      description: string;
      visible: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLivestream(id, title, startTime, externalLink, buttonLabel, description, visible);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestreams'] });
    },
  });
}

export function useDeleteLivestream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLivestream(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestreams'] });
    },
  });
}

// Links Queries
export function useGetAllLinks() {
  const { actor, isFetching } = useActor();

  return useQuery<LinkItem[]>({
    queryKey: ['links'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      textLabel, 
      url, 
      order 
    }: { 
      textLabel: string; 
      url: string; 
      order: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLink(textLabel, url, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

export function useUpdateLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      textLabel, 
      url, 
      visible, 
      order 
    }: { 
      id: string;
      textLabel: string; 
      url: string; 
      visible: boolean;
      order: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLink(id, textLabel, url, visible, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

export function useDeleteLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

export function useReorderLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrder: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderLinks(newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Site Content Queries
export function useGetSiteContent() {
  const { actor, isFetching } = useActor();

  return useQuery<SiteContent>({
    queryKey: ['siteContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSiteContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: SiteContent) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSiteContent(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteContent'] });
    },
  });
}

export function useUpdateBusinessTitle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBusinessTitle(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteContent'] });
    },
  });
}

// Homepage Section Queries
export function useGetHomepageSections() {
  const { actor, isFetching } = useActor();

  return useQuery<HomepageSection[]>({
    queryKey: ['homepageSections'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHomepageSections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHomepageSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: HomepageSection) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomepageSection(section);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
    },
  });
}

export function useUpdateHomepageSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, section }: { id: string; section: HomepageSection }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomepageSection(id, section);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
    },
  });
}

export function useDeleteHomepageSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHomepageSection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
    },
  });
}

export function useReorderHomepageSections() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrder: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderHomepageSections(newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
    },
  });
}

export function useToggleSectionVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleSectionVisibility(id, visible);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
    },
  });
}

// Analytics Queries
export function useGetAnalyticsData() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrackPageVisit() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (page: string) => {
      if (!actor) return;
      return actor.trackPageVisit(page);
    },
  });
}

export function useTrackElementClick() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (element: string) => {
      if (!actor) return;
      return actor.trackElementClick(element);
    },
  });
}

export function useTrackSectionView() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sectionId: string) => {
      if (!actor) return;
      return actor.trackSectionView(sectionId);
    },
  });
}

export function useTrackUniqueVisitor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) return null;
      return actor.trackUniqueVisitor(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// MP3 Player Queries
export function useGetAllMp3Tracks() {
  const { actor, isFetching } = useActor();

  return useQuery<Mp3Track[]>({
    queryKey: ['mp3Tracks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMp3Tracks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMp3TracksByPlaylist(playlistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Mp3Track[]>({
    queryKey: ['mp3TracksByPlaylist', playlistId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMp3TracksByPlaylist(playlistId);
    },
    enabled: !!actor && !isFetching && !!playlistId,
  });
}

export function useGetAllPlaylists() {
  const { actor, isFetching } = useActor();

  return useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlaylists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublicPlaylists() {
  const { actor, isFetching } = useActor();

  return useQuery<Playlist[]>({
    queryKey: ['publicPlaylists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicPlaylists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadMp3Track() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      artist, 
      duration, 
      file, 
      playlistId,
      order
    }: { 
      title: string; 
      artist: string; 
      duration: bigint; 
      file: ExternalBlob; 
      playlistId: string;
      order: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadMp3Track(title, artist, duration, file, playlistId, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp3Tracks'] });
      queryClient.invalidateQueries({ queryKey: ['mp3TracksByPlaylist'] });
    },
  });
}

export function useUpdateMp3Track() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      artist, 
      duration, 
      playlistId, 
      visible,
      order
    }: { 
      id: string; 
      title: string; 
      artist: string; 
      duration: bigint; 
      playlistId: string; 
      visible: boolean;
      order: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMp3Track(id, title, artist, duration, playlistId, visible, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp3Tracks'] });
      queryClient.invalidateQueries({ queryKey: ['mp3TracksByPlaylist'] });
    },
  });
}

export function useDeleteMp3Track() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMp3Track(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp3Tracks'] });
      queryClient.invalidateQueries({ queryKey: ['mp3TracksByPlaylist'] });
    },
  });
}

export function useReorderMp3Tracks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, newOrder }: { playlistId: string; newOrder: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderMp3Tracks(playlistId, newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp3Tracks'] });
      queryClient.invalidateQueries({ queryKey: ['mp3TracksByPlaylist'] });
    },
  });
}

export function useToggleMp3TrackVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleMp3TrackVisibility(id, visible);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp3Tracks'] });
      queryClient.invalidateQueries({ queryKey: ['mp3TracksByPlaylist'] });
    },
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPlaylist(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['publicPlaylists'] });
    },
  });
}

export function useUpdatePlaylist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      order, 
      visible 
    }: { 
      id: string; 
      name: string; 
      order: bigint; 
      visible: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePlaylist(id, name, order, visible);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['publicPlaylists'] });
    },
  });
}

export function useTogglePlaylistVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.togglePlaylistVisibility(id, visible);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['publicPlaylists'] });
    },
  });
}

// MP3 Play Count Queries
export function useIncrementPlayCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementPlayCount(trackId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp3Tracks'] });
      queryClient.invalidateQueries({ queryKey: ['mp3TracksByPlaylist'] });
    },
  });
}

export function useGetAllTrackPlayCounts() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['trackPlayCounts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrackPlayCounts();
    },
    enabled: !!actor && !isFetching,
  });
}
