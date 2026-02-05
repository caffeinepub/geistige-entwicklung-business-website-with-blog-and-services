import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AnalyticsData {
    sectionViews: Array<[string, bigint]>;
    pageVisits: Array<[string, bigint]>;
    dailyVisitors: Array<[string, bigint]>;
    elementClicks: Array<[string, bigint]>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Mp3Track {
    id: string;
    title: string;
    duration: bigint;
    order: bigint;
    file: ExternalBlob;
    playlistId: string;
    playCount: bigint;
    visible: boolean;
    artist: string;
}
export type SectionType = {
    __kind__: "meetings";
    meetings: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "blog";
    blog: null;
} | {
    __kind__: "links";
    links: null;
} | {
    __kind__: "livestream";
    livestream: null;
} | {
    __kind__: "mp3Player";
    mp3Player: null;
} | {
    __kind__: "storeItems";
    storeItems: null;
};
export interface EmbeddedImage {
    id: string;
    url: ExternalBlob;
    size: string;
    position: bigint;
    altText: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface HomepageSection {
    id: string;
    title: string;
    order: bigint;
    sectionType: SectionType;
    description: string;
    visible: boolean;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SiteContent {
    businessTitle: string;
    blogDescription: string;
    meetingDescription: string;
    linksTitle: string;
    livestreamTitle: string;
    storeItemsDescription: string;
    meetingTitle: string;
    livestreamDescription: string;
    mp3PlayerTitle: string;
    showLivestreamSection: boolean;
    blogTitle: string;
    linksDescription: string;
    showNewSection: boolean;
    storeItemsTitle: string;
    showLinksSection: boolean;
    showMp3PlayerSection: boolean;
    footerContent: string;
    mp3PlayerDescription: string;
}
export interface EditRecord {
    previousTitle: string;
    editor: Principal;
    previousExcerpt: string;
    timestamp: Time;
    previousContent: string;
}
export interface BlogPost {
    id: string;
    embeddedImages: Array<EmbeddedImage>;
    title: string;
    content: string;
    associatedFiles: Array<ExternalBlob>;
    editHistory: Array<EditRecord>;
    publicationDate: Time;
    excerpt: string;
}
export interface MeetingSlot {
    id: string;
    startTime: Time;
    description: string;
    durationMinutes: bigint;
    isBooked: boolean;
}
export type ProductType = {
    __kind__: "clothing";
    clothing: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "eBook";
    eBook: null;
};
export interface Playlist {
    id: string;
    order: bigint;
    name: string;
    visible: boolean;
}
export interface Livestream {
    id: string;
    startTime: Time;
    title: string;
    externalLink: string;
    creationTimestamp: Time;
    description: string;
    visible: boolean;
    buttonLabel: string;
}
export interface LinkItem {
    id: string;
    url: string;
    textLabel: string;
    order: bigint;
    visible: boolean;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StoreItem {
    id: string;
    title: string;
    description: string;
    productType: ProductType;
    available: boolean;
    coverImage: ExternalBlob;
    price: bigint;
    previewImages: Array<ExternalBlob>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Appointment {
    id: string;
    customerName: string;
    timeSlotId: string;
    bookedBy: Principal;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlogFile(blogId: string, file: ExternalBlob): Promise<string>;
    addBlogImage(blogId: string, imageUrl: ExternalBlob, position: bigint, altText: string, size: string): Promise<string>;
    addHomepageSection(section: HomepageSection): Promise<void>;
    addLink(textLabel: string, url: string, order: bigint): Promise<string>;
    addLivestream(title: string, startTime: Time, externalLink: string, buttonLabel: string, description: string): Promise<string>;
    addMeetingSlot(startTime: Time, durationMinutes: bigint, description: string): Promise<string>;
    addStoreItem(title: string, description: string, price: bigint, coverImage: ExternalBlob, productType: ProductType, previewImages: Array<ExternalBlob>): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(customerName: string, timeSlotId: string): Promise<string>;
    cancelAppointment(appointmentId: string): Promise<void>;
    createBlogPost(title: string, content: string, excerpt: string): Promise<string>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPlaylist(name: string): Promise<string>;
    deleteBlogFile(blogId: string, _filePath: string): Promise<void>;
    deleteBlogImage(blogId: string, imageId: string): Promise<void>;
    deleteBlogPost(id: string): Promise<void>;
    deleteHomepageSection(id: string): Promise<void>;
    deleteLink(id: string): Promise<void>;
    deleteLivestream(id: string): Promise<void>;
    deleteMp3Track(id: string): Promise<void>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllLinks(): Promise<Array<LinkItem>>;
    getAllLivestreams(): Promise<Array<Livestream>>;
    getAllMeetingSlots(): Promise<Array<MeetingSlot>>;
    getAllMp3Tracks(): Promise<Array<Mp3Track>>;
    getAllPlaylists(): Promise<Array<Playlist>>;
    getAllStoreItems(): Promise<Array<StoreItem>>;
    getAllTrackPlayCounts(): Promise<Array<[string, bigint]>>;
    getAnalyticsData(): Promise<AnalyticsData>;
    getAvailableMeetingSlots(): Promise<Array<MeetingSlot>>;
    getBlogPost(id: string): Promise<BlogPost | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHomepageSections(): Promise<Array<HomepageSection>>;
    getLivestream(id: string): Promise<Livestream | null>;
    getMeetingSlot(id: string): Promise<MeetingSlot | null>;
    getMp3TracksByPlaylist(playlistId: string): Promise<Array<Mp3Track>>;
    getMyAppointments(): Promise<Array<Appointment>>;
    getPublicPlaylists(): Promise<Array<Playlist>>;
    getSiteContent(): Promise<SiteContent>;
    getStoreItem(id: string): Promise<StoreItem | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTrackPlayCount(trackId: string): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementPlayCount(trackId: string): Promise<void>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    reorderHomepageSections(newOrder: Array<string>): Promise<void>;
    reorderLinks(newOrder: Array<string>): Promise<void>;
    reorderMp3Tracks(playlistId: string, newOrder: Array<string>): Promise<void>;
    resetAllTrackPlayCounts(): Promise<void>;
    resetTrackPlayCount(trackId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    toggleMp3TrackVisibility(id: string, visible: boolean): Promise<void>;
    togglePlaylistVisibility(id: string, visible: boolean): Promise<void>;
    toggleSectionVisibility(id: string, visible: boolean): Promise<void>;
    trackElementClick(element: string): Promise<void>;
    trackPageVisit(page: string): Promise<void>;
    trackSectionView(sectionId: string): Promise<void>;
    trackUniqueVisitor(_sessionId: string): Promise<{
        dayKey: string;
        count: bigint;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBlogDescription(description: string): Promise<void>;
    updateBlogImage(blogId: string, imageId: string, position: bigint, size: string, altText: string): Promise<void>;
    updateBlogPost(id: string, newTitle: string, newContent: string, newExcerpt: string): Promise<void>;
    updateBlogTitle(title: string): Promise<void>;
    updateBusinessTitle(newTitle: string): Promise<void>;
    updateExcerpt(id: string, newExcerpt: string): Promise<void>;
    updateHomepageSection(id: string, updatedSection: HomepageSection): Promise<void>;
    updateLink(id: string, textLabel: string, url: string, visible: boolean, order: bigint): Promise<void>;
    updateLivestream(id: string, title: string, startTime: Time, externalLink: string, buttonLabel: string, description: string, visible: boolean): Promise<void>;
    updateMeetingSlot(id: string, startTime: Time, durationMinutes: bigint, description: string): Promise<void>;
    updateMp3Track(id: string, title: string, artist: string, duration: bigint, playlistId: string, visible: boolean, order: bigint): Promise<void>;
    updatePlaylist(id: string, name: string, order: bigint, visible: boolean): Promise<void>;
    updateSiteContent(newContent: SiteContent): Promise<void>;
    updateStoreItem(id: string, title: string, description: string, price: bigint, coverImage: ExternalBlob, productType: ProductType, available: boolean, previewImages: Array<ExternalBlob>): Promise<void>;
    uploadMp3Track(title: string, artist: string, duration: bigint, file: ExternalBlob, playlistId: string, order: bigint): Promise<string>;
}
