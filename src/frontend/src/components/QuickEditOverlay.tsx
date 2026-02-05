import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, FileText, ShoppingBag, Calendar, Video, Link as LinkIcon } from 'lucide-react';
import { useGetAllBlogPosts, useGetAllStoreItems, useGetAllMeetingSlots, useGetAllLivestreams, useGetAllLinks } from '../hooks/useQueries';
import InlineEditBlogPost from './InlineEditBlogPost';
import InlineEditEBook from './InlineEditEBook';
import InlineEditMeetingSlot from './InlineEditMeetingSlot';
import InlineEditLivestream from './InlineEditLivestream';
import InlineEditLink from './InlineEditLink';
import type { BlogPost, StoreItem, MeetingSlot, Livestream, LinkItem } from '../backend';

interface QuickEditOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickEditOverlay({ isOpen, onClose }: QuickEditOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [selectedStoreItem, setSelectedStoreItem] = useState<StoreItem | null>(null);
  const [selectedMeetingSlot, setSelectedMeetingSlot] = useState<MeetingSlot | null>(null);
  const [selectedLivestream, setSelectedLivestream] = useState<Livestream | null>(null);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);

  const { data: blogPosts } = useGetAllBlogPosts();
  const { data: storeItems } = useGetAllStoreItems();
  const { data: meetingSlots } = useGetAllMeetingSlots();
  const { data: livestreams } = useGetAllLivestreams();
  const { data: links } = useGetAllLinks();

  const filteredBlogPosts = blogPosts?.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStoreItems = storeItems?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMeetingSlots = meetingSlots?.filter(slot =>
    slot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLivestreams = livestreams?.filter(stream =>
    stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stream.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLinks = links?.filter(link =>
    link.textLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setSelectedBlogPost(null);
    setSelectedStoreItem(null);
    setSelectedMeetingSlot(null);
    setSelectedLivestream(null);
    setSelectedLink(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Schnellbearbeitung</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="blog" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="blog" className="gap-2">
              <FileText className="h-4 w-4" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Store
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-2">
              <Calendar className="h-4 w-4" />
              Termine
            </TabsTrigger>
            <TabsTrigger value="livestream" className="gap-2">
              <Video className="h-4 w-4" />
              Livestream
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blog" className="flex-1 overflow-y-auto mt-4">
            {selectedBlogPost ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBlogPost(null)}
                  className="mb-4"
                >
                  ← Zurück zur Liste
                </Button>
                <InlineEditBlogPost
                  post={selectedBlogPost}
                  onCancel={() => setSelectedBlogPost(null)}
                  onSave={() => setSelectedBlogPost(null)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBlogPosts && filteredBlogPosts.length > 0 ? (
                  filteredBlogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedBlogPost(post)}
                    >
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Blogbeiträge gefunden
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="store" className="flex-1 overflow-y-auto mt-4">
            {selectedStoreItem ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStoreItem(null)}
                  className="mb-4"
                >
                  ← Zurück zur Liste
                </Button>
                <InlineEditEBook
                  storeItem={selectedStoreItem}
                  onCancel={() => setSelectedStoreItem(null)}
                  onSave={() => setSelectedStoreItem(null)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStoreItems && filteredStoreItems.length > 0 ? (
                  filteredStoreItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedStoreItem(item)}
                    >
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        {(Number(item.price) / 100).toLocaleString('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Store Items gefunden
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meetings" className="flex-1 overflow-y-auto mt-4">
            {selectedMeetingSlot ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMeetingSlot(null)}
                  className="mb-4"
                >
                  ← Zurück zur Liste
                </Button>
                <InlineEditMeetingSlot
                  slot={selectedMeetingSlot}
                  onCancel={() => setSelectedMeetingSlot(null)}
                  onSave={() => setSelectedMeetingSlot(null)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMeetingSlots && filteredMeetingSlots.length > 0 ? (
                  filteredMeetingSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMeetingSlot(slot)}
                    >
                      <h4 className="font-medium">
                        {new Date(Number(slot.startTime) / 1000000).toLocaleString('de-DE')}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {slot.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dauer: {Number(slot.durationMinutes)} Minuten
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Termine gefunden
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="livestream" className="flex-1 overflow-y-auto mt-4">
            {selectedLivestream ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLivestream(null)}
                  className="mb-4"
                >
                  ← Zurück zur Liste
                </Button>
                <InlineEditLivestream
                  livestream={selectedLivestream}
                  onCancel={() => setSelectedLivestream(null)}
                  onSave={() => setSelectedLivestream(null)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLivestreams && filteredLivestreams.length > 0 ? (
                  filteredLivestreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLivestream(stream)}
                    >
                      <h4 className="font-medium">{stream.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {stream.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Number(stream.startTime) / 1000000).toLocaleString('de-DE')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Livestreams gefunden
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="flex-1 overflow-y-auto mt-4">
            {selectedLink ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLink(null)}
                  className="mb-4"
                >
                  ← Zurück zur Liste
                </Button>
                <InlineEditLink
                  link={selectedLink}
                  onCancel={() => setSelectedLink(null)}
                  onSave={() => setSelectedLink(null)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLinks && filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLink(link)}
                    >
                      <h4 className="font-medium">{link.textLabel}</h4>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {link.url}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Links gefunden
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
