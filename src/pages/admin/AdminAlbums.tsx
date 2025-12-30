import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Camera, Loader2, Trash2 } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
}

interface Album {
  id: string;
  bar_id: string;
  title: string;
  artist: string | null;
  disk_number: number;
  cover_url: string | null;
  genre: string | null;
  year: number | null;
  bars?: { name: string };
}

interface ScannedSong {
  track_number: number;
  title: string;
  duration?: string;
  artist?: string;
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedSongs, setScannedSongs] = useState<ScannedSong[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    bar_id: '',
    title: '',
    artist: '',
    disk_number: 1,
    cover_url: '',
    genre: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [albumsRes, barsRes] = await Promise.all([
      supabase.from('albums').select('*, bars(name)').order('disk_number'),
      supabase.from('bars').select('id, name').order('name'),
    ]);

    if (albumsRes.error) toast.error('Failed to load albums');
    else setAlbums(albumsRes.data || []);

    if (barsRes.error) toast.error('Failed to load bars');
    else setBars(barsRes.data || []);

    setLoading(false);
  };

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    
    try {
      // Convert to base64
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
    
    if (!formData.bar_id) {
      toast.error('Please select a bar');
      return;
    }

    // Create album
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .insert([{
        bar_id: formData.bar_id,
        title: formData.title,
        artist: formData.artist || null,
        disk_number: formData.disk_number,
        cover_url: formData.cover_url || null,
        genre: formData.genre || null,
        year: formData.year || null,
      }])
      .select()
      .single();

    if (albumError) {
      toast.error(albumError.message);
      return;
    }

    // Insert songs if scanned
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
      bar_id: '',
      title: '',
      artist: '',
      disk_number: 1,
      cover_url: '',
      genre: '',
      year: new Date().getFullYear(),
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this album and all its songs?')) return;
    
    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Album deleted');
      fetchData();
    }
  };

  const openNewDialog = () => {
    setScannedSongs([]);
    setFormData({
      bar_id: '',
      title: '',
      artist: '',
      disk_number: 1,
      cover_url: '',
      genre: '',
      year: new Date().getFullYear(),
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Albums</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
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
                    <Label>Album Cover</Label>
                    <ImageUpload
                      bucket="album-covers"
                      folder={formData.bar_id || 'temp'}
                      currentUrl={formData.cover_url}
                      onUpload={(url) => setFormData({ ...formData, cover_url: url })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bar</Label>
                      <Select
                        value={formData.bar_id}
                        onValueChange={(value) => setFormData({ ...formData, bar_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bar" />
                        </SelectTrigger>
                        <SelectContent>
                          {bars.map((bar) => (
                            <SelectItem key={bar.id} value={bar.id}>
                              {bar.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>
                </div>

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

                {/* AI Scanner Section */}
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

                {/* Scanned Songs Preview */}
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

        <Card className="glass">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Cover</TableHead>
                  <TableHead className="w-16">Disk</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Bar</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : albums.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No albums yet. Add your first album!
                    </TableCell>
                  </TableRow>
                ) : (
                  albums.map((album) => (
                    <TableRow key={album.id}>
                      <TableCell>
                        {album.cover_url ? (
                          <img src={album.cover_url} alt={album.title} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No img</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary/20 text-primary font-bold text-sm">
                          {album.disk_number}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{album.title}</TableCell>
                      <TableCell className="text-muted-foreground">{album.artist || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{album.bars?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{album.genre || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(album.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
