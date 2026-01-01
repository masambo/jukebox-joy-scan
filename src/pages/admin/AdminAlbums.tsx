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
import { Plus, Camera, Loader2, Trash2, Pencil, Music, Upload, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface Song {
  id: string;
  album_id: string;
  title: string;
  track_number: number;
  artist: string | null;
  duration: string | null;
}

interface BulkAlbumItem {
  id: string;
  file: File;
  preview: string;
  title: string;
  artist: string;
  disk_number: number;
  genre: string;
  year: number;
  bar_id: string;
  scanning: boolean;
  scannedSongs: ScannedSong[];
  uploaded: boolean;
  cover_url: string;
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedSongs, setScannedSongs] = useState<ScannedSong[]>([]);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [songsDialogOpen, setSongsDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songFormData, setSongFormData] = useState({
    title: '',
    track_number: 1,
    artist: '',
    duration: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Bulk upload state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkItems, setBulkItems] = useState<BulkAlbumItem[]>([]);
  const [bulkBarId, setBulkBarId] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  
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

    const dataToSave = {
      bar_id: formData.bar_id,
      title: formData.title,
      artist: formData.artist || null,
      disk_number: formData.disk_number,
      cover_url: formData.cover_url || null,
      genre: formData.genre || null,
      year: formData.year || null,
    };

    if (editingAlbum) {
      // Update existing album
      const { error } = await supabase
        .from('albums')
        .update(dataToSave)
        .eq('id', editingAlbum.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Album updated successfully');
    } else {
      // Create new album
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .insert([dataToSave])
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
    }

    setDialogOpen(false);
    setScannedSongs([]);
    setEditingAlbum(null);
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

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      bar_id: album.bar_id,
      title: album.title,
      artist: album.artist || '',
      disk_number: album.disk_number,
      cover_url: album.cover_url || '',
      genre: album.genre || '',
      year: album.year || new Date().getFullYear(),
    });
    setScannedSongs([]);
    setDialogOpen(true);
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
    setEditingAlbum(null);
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

  // Songs management
  const openSongsDialog = async (album: Album) => {
    setSelectedAlbum(album);
    await fetchSongs(album.id);
    setSongsDialogOpen(true);
  };

  const fetchSongs = async (albumId: string) => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('album_id', albumId)
      .order('track_number');
    
    if (error) {
      toast.error('Failed to load songs');
    } else {
      setSongs(data || []);
    }
  };

  const openNewSongForm = () => {
    setEditingSong(null);
    setSongFormData({
      title: '',
      track_number: songs.length + 1,
      artist: selectedAlbum?.artist || '',
      duration: '',
    });
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setSongFormData({
      title: song.title,
      track_number: song.track_number,
      artist: song.artist || '',
      duration: song.duration || '',
    });
  };

  const handleSaveSong = async () => {
    if (!selectedAlbum) return;

    if (!songFormData.title.trim()) {
      toast.error('Song title is required');
      return;
    }

    const dataToSave = {
      album_id: selectedAlbum.id,
      title: songFormData.title,
      track_number: songFormData.track_number,
      artist: songFormData.artist || null,
      duration: songFormData.duration || null,
    };

    if (editingSong) {
      const { error } = await supabase
        .from('songs')
        .update(dataToSave)
        .eq('id', editingSong.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Song updated');
        setEditingSong(null);
        fetchSongs(selectedAlbum.id);
      }
    } else {
      const { error } = await supabase.from('songs').insert([dataToSave]);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Song added');
        fetchSongs(selectedAlbum.id);
      }
    }

    setSongFormData({
      title: '',
      track_number: songs.length + 2,
      artist: selectedAlbum.artist || '',
      duration: '',
    });
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Delete this song?')) return;

    const { error } = await supabase.from('songs').delete().eq('id', songId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Song deleted');
      if (selectedAlbum) {
        fetchSongs(selectedAlbum.id);
      }
    }
  };

  // Bulk upload functions
  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: BulkAlbumItem[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      artist: '',
      disk_number: bulkItems.length + idx + 1,
      genre: '',
      year: new Date().getFullYear(),
      bar_id: bulkBarId,
      scanning: false,
      scannedSongs: [],
      uploaded: false,
      cover_url: '',
    }));

    setBulkItems([...bulkItems, ...newItems]);
  };

  const updateBulkItem = (id: string, updates: Partial<BulkAlbumItem>) => {
    setBulkItems(items => items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeBulkItem = (id: string) => {
    setBulkItems(items => {
      const item = items.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return items.filter(i => i.id !== id);
    });
  };

  const scanBulkItemImage = async (item: BulkAlbumItem) => {
    updateBulkItem(item.id, { scanning: true });
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await supabase.functions.invoke('scan-album', {
          body: { imageBase64: base64 },
        });

        if (response.error) {
          toast.error(`Failed to scan ${item.title}`);
        } else if (response.data.songs) {
          updateBulkItem(item.id, { scannedSongs: response.data.songs });
          toast.success(`Found ${response.data.songs.length} songs in ${item.title}`);
        }
        updateBulkItem(item.id, { scanning: false });
      };
      reader.readAsDataURL(item.file);
    } catch (error) {
      toast.error(`Failed to scan ${item.title}`);
      updateBulkItem(item.id, { scanning: false });
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkBarId) {
      toast.error('Please select a bar first');
      return;
    }

    if (bulkItems.length === 0) {
      toast.error('No albums to upload');
      return;
    }

    setBulkUploading(true);
    let successCount = 0;

    for (const item of bulkItems) {
      try {
        // Upload cover image
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${bulkBarId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('album-covers')
          .upload(filePath, item.file);

        if (uploadError) {
          toast.error(`Failed to upload cover for ${item.title}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('album-covers')
          .getPublicUrl(filePath);

        // Create album
        const { data: album, error: albumError } = await supabase
          .from('albums')
          .insert([{
            bar_id: bulkBarId,
            title: item.title,
            artist: item.artist || null,
            disk_number: item.disk_number,
            cover_url: publicUrl,
            genre: item.genre || null,
            year: item.year || null,
          }])
          .select()
          .single();

        if (albumError) {
          toast.error(`Failed to create album ${item.title}`);
          continue;
        }

        // Insert songs if scanned
        if (item.scannedSongs.length > 0) {
          const songsToInsert = item.scannedSongs.map((song) => ({
            album_id: album.id,
            title: song.title,
            track_number: song.track_number,
            duration: song.duration || null,
            artist: song.artist || item.artist || null,
          }));

          await supabase.from('songs').insert(songsToInsert);
        }

        successCount++;
      } catch (error) {
        toast.error(`Error processing ${item.title}`);
      }
    }

    setBulkUploading(false);
    toast.success(`Successfully created ${successCount} of ${bulkItems.length} albums`);
    
    // Cleanup
    bulkItems.forEach(item => URL.revokeObjectURL(item.preview));
    setBulkItems([]);
    setBulkDialogOpen(false);
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Albums</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Album
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAlbum ? 'Edit Album' : 'Add New Album'}</DialogTitle>
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
                  {editingAlbum 
                    ? 'Update Album' 
                    : `Create Album${scannedSongs.length > 0 ? ` with ${scannedSongs.length} Songs` : ''}`
                  }
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Bulk Upload Dialog */}
        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Upload Albums</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Bar Selection */}
              <div className="space-y-2">
                <Label>Select Bar for All Albums</Label>
                <Select value={bulkBarId} onValueChange={setBulkBarId}>
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

              {/* File Input */}
              <div className="space-y-2">
                <Label>Upload Album Covers</Label>
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkFilesSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bulkFileInputRef.current?.click()}
                  className="w-full"
                  disabled={!bulkBarId}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Images
                </Button>
                {!bulkBarId && (
                  <p className="text-xs text-muted-foreground">Please select a bar first</p>
                )}
              </div>

              {/* Album Items */}
              {bulkItems.length > 0 && (
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {bulkItems.map((item) => (
                      <Card key={item.id} className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeBulkItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Preview */}
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={item.preview}
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            
                            {/* Form */}
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-4 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Disk #</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.disk_number}
                                    onChange={(e) => updateBulkItem(item.id, { disk_number: parseInt(e.target.value) || 1 })}
                                  />
                                </div>
                                <div className="col-span-3 space-y-1">
                                  <Label className="text-xs">Title</Label>
                                  <Input
                                    value={item.title}
                                    onChange={(e) => updateBulkItem(item.id, { title: e.target.value })}
                                    placeholder="Album title"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Artist</Label>
                                  <Input
                                    value={item.artist}
                                    onChange={(e) => updateBulkItem(item.id, { artist: e.target.value })}
                                    placeholder="Artist"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Genre</Label>
                                  <Input
                                    value={item.genre}
                                    onChange={(e) => updateBulkItem(item.id, { genre: e.target.value })}
                                    placeholder="Genre"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Year</Label>
                                  <Input
                                    type="number"
                                    value={item.year}
                                    onChange={(e) => updateBulkItem(item.id, { year: parseInt(e.target.value) })}
                                  />
                                </div>
                              </div>
                              
                              {/* Scan Button */}
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => scanBulkItemImage(item)}
                                  disabled={item.scanning}
                                >
                                  {item.scanning ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Scanning...
                                    </>
                                  ) : (
                                    <>
                                      <Camera className="h-3 w-3 mr-1" />
                                      Scan for Songs
                                    </>
                                  )}
                                </Button>
                                {item.scannedSongs.length > 0 && (
                                  <span className="text-xs text-primary">
                                    {item.scannedSongs.length} songs found
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Upload Button */}
              {bulkItems.length > 0 && (
                <Button
                  className="w-full"
                  onClick={handleBulkUpload}
                  disabled={bulkUploading || !bulkBarId}
                >
                  {bulkUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {bulkItems.length} Albums
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openSongsDialog(album)} title="Manage songs">
                            <Music className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(album)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(album.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Songs Management Dialog */}
        <Dialog open={songsDialogOpen} onOpenChange={setSongsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Songs - {selectedAlbum?.title}
              </DialogTitle>
            </DialogHeader>
            
            {/* Add/Edit Song Form */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {editingSong ? 'Edit Song' : 'Add New Song'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Track #</Label>
                    <Input
                      type="number"
                      min="1"
                      value={songFormData.track_number}
                      onChange={(e) => setSongFormData({ ...songFormData, track_number: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={songFormData.title}
                      onChange={(e) => setSongFormData({ ...songFormData, title: e.target.value })}
                      placeholder="Song title"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration</Label>
                    <Input
                      value={songFormData.duration}
                      onChange={(e) => setSongFormData({ ...songFormData, duration: e.target.value })}
                      placeholder="3:45"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={songFormData.artist}
                    onChange={(e) => setSongFormData({ ...songFormData, artist: e.target.value })}
                    placeholder="Artist (optional)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleSaveSong}>
                    {editingSong ? 'Update' : 'Add'}
                  </Button>
                  {editingSong && (
                    <Button type="button" variant="outline" onClick={openNewSongForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Songs List */}
            <div className="space-y-2">
              <Label>Songs ({songs.length})</Label>
              {songs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No songs yet. Add your first song above.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead className="w-20">Duration</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {songs.map((song) => (
                        <TableRow key={song.id}>
                          <TableCell className="font-medium">{song.track_number}</TableCell>
                          <TableCell>{song.title}</TableCell>
                          <TableCell className="text-muted-foreground">{song.artist || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{song.duration || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditSong(song)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteSong(song.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
