import React, { useEffect, useState, useRef } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { useManagerBar } from '@/hooks/useManagerBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Camera, Loader2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Album {
  id: string;
  title: string;
  artist: string | null;
  disk_number: number;
  genre: string | null;
  year: number | null;
}

interface Song {
  id: string;
  album_id: string;
  title: string;
  track_number: number;
  duration: string | null;
}

interface ScannedSong {
  track_number: number;
  title: string;
  duration?: string;
  artist?: string;
}

export default function ManagerAlbums() {
  const { bar, loading: barLoading } = useManagerBar();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Record<string, Song[]>>({});
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedSongs, setScannedSongs] = useState<ScannedSong[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    disk_number: 1,
    genre: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (bar) {
      fetchAlbums();
    }
  }, [bar]);

  const fetchAlbums = async () => {
    if (!bar) return;
    
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('bar_id', bar.id)
      .order('disk_number');

    if (error) {
      toast.error('Failed to load albums');
    } else {
      setAlbums(data || []);
    }
    setLoading(false);
  };

  const fetchSongsForAlbum = async (albumId: string) => {
    if (songs[albumId]) return; // Already fetched
    
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('album_id', albumId)
      .order('track_number');

    if (!error && data) {
      setSongs(prev => ({ ...prev, [albumId]: data }));
    }
  };

  const toggleAlbum = (albumId: string) => {
    const newExpanded = new Set(expandedAlbums);
    if (newExpanded.has(albumId)) {
      newExpanded.delete(albumId);
    } else {
      newExpanded.add(albumId);
      fetchSongsForAlbum(albumId);
    }
    setExpandedAlbums(newExpanded);
  };

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await supabase.functions.invoke('scan-album', {
          body: { imageBase64: base64 },
        });

        if (response.error) {
          toast.error(response.error.message || 'Failed to scan image');
        } else if (response.data.songs) {
          setScannedSongs(response.data.songs);
          toast.success(`Found ${response.data.songs.length} songs!`);
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process image');
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bar) return;

    const { data: album, error: albumError } = await supabase
      .from('albums')
      .insert([{
        bar_id: bar.id,
        title: formData.title,
        artist: formData.artist || null,
        disk_number: formData.disk_number,
        genre: formData.genre || null,
        year: formData.year || null,
      }])
      .select()
      .single();

    if (albumError) {
      toast.error(albumError.message);
      return;
    }

    if (scannedSongs.length > 0) {
      const songsToInsert = scannedSongs.map((song) => ({
        album_id: album.id,
        title: song.title,
        track_number: song.track_number,
        duration: song.duration || null,
        artist: song.artist || formData.artist || null,
      }));

      const { error: songsError } = await supabase.from('songs').insert(songsToInsert);
      if (songsError) {
        toast.error('Album created but failed to add songs');
      }
    }

    toast.success('Album created successfully');
    setDialogOpen(false);
    setScannedSongs([]);
    setFormData({
      title: '',
      artist: '',
      disk_number: 1,
      genre: '',
      year: new Date().getFullYear(),
    });
    fetchAlbums();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this album and all its songs?')) return;
    
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Album deleted');
      fetchAlbums();
    }
  };

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
          <h1 className="text-3xl font-heading font-bold">Albums</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Album
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Album</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Album Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disk_number">Disk Number</Label>
                    <Input
                      id="disk_number"
                      type="number"
                      min="1"
                      value={formData.disk_number}
                      onChange={(e) => setFormData({ ...formData, disk_number: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      AI Track Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      Take a photo of the album's track listing and AI will extract all songs automatically.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleScanImage}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={scanning}
                      className="w-full"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Scan Album Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {scannedSongs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Scanned Songs ({scannedSongs.length})</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-20">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scannedSongs.map((song, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{song.track_number}</TableCell>
                              <TableCell>{song.title}</TableCell>
                              <TableCell>{song.duration || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Create Album {scannedSongs.length > 0 && `with ${scannedSongs.length} Songs`}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {albums.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No albums yet. Add your first album!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {albums.map((album) => (
              <Collapsible key={album.id} open={expandedAlbums.has(album.id)}>
                <Card className="glass">
                  <CollapsibleTrigger asChild>
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => toggleAlbum(album.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 text-primary font-bold text-lg">
                          {album.disk_number}
                        </span>
                        <div>
                          <h3 className="font-semibold">{album.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {album.artist || 'Unknown Artist'} • {album.genre || 'No genre'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(album.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {expandedAlbums.has(album.id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border">
                      {songs[album.id]?.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Track</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead className="w-24">Duration</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {songs[album.id].map((song) => (
                              <TableRow key={song.id}>
                                <TableCell className="font-medium">{song.track_number}</TableCell>
                                <TableCell>{song.title}</TableCell>
                                <TableCell className="text-muted-foreground">{song.duration || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          No songs in this album
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
