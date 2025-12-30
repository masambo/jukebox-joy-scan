import React, { useEffect, useState } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { useManagerBar } from '@/hooks/useManagerBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Loader2, Trash2, Music2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Playlist {
  id: string;
  name: string;
  created_at: string;
  song_count?: number;
}

interface Song {
  id: string;
  title: string;
  track_number: number;
  album_title?: string;
  disk_number?: number;
}

export default function ManagerPlaylists() {
  const { bar, loading: barLoading } = useManagerBar();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addSongsDialogOpen, setAddSongsDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [playlistName, setPlaylistName] = useState('');

  useEffect(() => {
    if (bar) {
      fetchPlaylists();
    }
  }, [bar]);

  const fetchPlaylists = async () => {
    if (!bar) return;
    
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        id,
        name,
        created_at,
        playlist_songs(count)
      `)
      .eq('bar_id', bar.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load playlists');
    } else {
      const playlistsWithCount = (data || []).map(p => ({
        ...p,
        song_count: (p.playlist_songs as any)?.[0]?.count || 0
      }));
      setPlaylists(playlistsWithCount);
    }
    setLoading(false);
  };

  const fetchAvailableSongs = async () => {
    if (!bar) return;
    
    const { data, error } = await supabase
      .from('songs')
      .select(`
        id,
        title,
        track_number,
        albums!inner(title, disk_number, bar_id)
      `)
      .eq('albums.bar_id', bar.id)
      .order('title');

    if (error) {
      toast.error('Failed to load songs');
    } else {
      const songs = (data || []).map(s => ({
        id: s.id,
        title: s.title,
        track_number: s.track_number,
        album_title: (s.albums as any)?.title,
        disk_number: (s.albums as any)?.disk_number,
      }));
      setAvailableSongs(songs);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bar || !user) return;

    const { error } = await supabase
      .from('playlists')
      .insert([{
        bar_id: bar.id,
        name: playlistName,
        created_by: user.id,
      }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Playlist created!');
      setDialogOpen(false);
      setPlaylistName('');
      fetchPlaylists();
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('Delete this playlist?')) return;
    
    const { error } = await supabase.from('playlists').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Playlist deleted');
      fetchPlaylists();
    }
  };

  const openAddSongsDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setSelectedSongs(new Set());
    setSearchQuery('');
    fetchAvailableSongs();
    setAddSongsDialogOpen(true);
  };

  const handleAddSongs = async () => {
    if (!selectedPlaylist || selectedSongs.size === 0) return;

    // Get existing songs in playlist to determine next position
    const { data: existingSongs } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', selectedPlaylist.id)
      .order('position', { ascending: false })
      .limit(1);

    let nextPosition = (existingSongs?.[0]?.position || 0) + 1;

    const songsToAdd = Array.from(selectedSongs).map((songId, idx) => ({
      playlist_id: selectedPlaylist.id,
      song_id: songId,
      position: nextPosition + idx,
    }));

    const { error } = await supabase.from('playlist_songs').insert(songsToAdd);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added ${selectedSongs.size} songs to playlist`);
      setAddSongsDialogOpen(false);
      fetchPlaylists();
    }
  };

  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (barLoading || loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ManagerLayout>
    );
  }

  if (!bar) {
    return (
      <ManagerLayout>
        <div className="p-6">
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">You are not assigned to any bar yet.</p>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout barName={bar.name}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Playlists</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playlist Name</Label>
                  <Input
                    id="name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Friday Night Hits"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Playlist</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {playlists.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No playlists yet. Create your first playlist!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="glass">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Music2 className="h-4 w-4" />
                    <span>{playlist.song_count} songs</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openAddSongsDialog(playlist)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Songs
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Songs Dialog */}
        <Dialog open={addSongsDialogOpen} onOpenChange={setAddSongsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Songs to {selectedPlaylist?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Song</TableHead>
                      <TableHead>Album</TableHead>
                      <TableHead className="w-16">Disk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSongs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedSongs.has(song.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedSongs);
                              if (checked) {
                                newSelected.add(song.id);
                              } else {
                                newSelected.delete(song.id);
                              }
                              setSelectedSongs(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{song.title}</TableCell>
                        <TableCell className="text-muted-foreground">{song.album_title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{song.disk_number}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedSongs.size} songs selected
                </span>
                <Button onClick={handleAddSongs} disabled={selectedSongs.size === 0}>
                  Add Selected Songs
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ManagerLayout>
  );
}
