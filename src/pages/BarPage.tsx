import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Music2, Loader2, Grid3x3, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SearchBar from "@/components/jukebox/SearchBar";
import GenreFilter from "@/components/jukebox/GenreFilter";
import AlbumCard from "@/components/jukebox/AlbumCard";
import SongList from "@/components/jukebox/SongList";
import AlbumDetail from "@/components/jukebox/AlbumDetail";
import { Card, CardContent } from "@/components/ui/card";
import { JukeboxEntryDialog } from "@/components/jukebox/JukeboxEntryDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Song {
  id: string;
  title: string;
  artist: string;
  diskNumber: number;
  trackNumber: number;
  genre: string;
  albumId: string;
  duration?: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  diskNumber: number;
  genre: string;
  year: number;
  songs: Song[];
}

interface Bar {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  description: string | null;
}

const BarPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [bar, setBar] = useState<Bar | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'albums' | 'songs'>('albums');
  const [songSortBy, setSongSortBy] = useState<'all' | 'disc'>('all');
  const [songSortOrder, setSongSortOrder] = useState<'disc' | 'a-z' | 'z-a'>('disc');

  useEffect(() => {
    if (slug) {
      fetchBarData();
    }
  }, [slug]);

  const fetchBarData = async () => {
    setLoading(true);
    setError(null);

    // Fetch bar by slug
    const { data: barData, error: barError } = await supabase
      .from('bars')
      .select('*')
      .eq('slug', slug)
      .single();

    if (barError || !barData) {
      setError('Bar not found');
      setLoading(false);
      return;
    }

    setBar(barData);

    // Fetch albums with songs for this bar
    const { data: albumsData, error: albumsError } = await supabase
      .from('albums')
      .select(`
        *,
        songs (*)
      `)
      .eq('bar_id', barData.id)
      .order('disk_number');

    if (albumsError) {
      setError('Failed to load albums');
      setLoading(false);
      return;
    }

    // Transform data to match component expectations
    const transformedAlbums: Album[] = (albumsData || []).map(album => ({
      id: album.id,
      title: album.title,
      artist: album.artist || 'Unknown Artist',
      cover: album.cover_url || '/placeholder.svg',
      diskNumber: album.disk_number,
      genre: album.genre || 'Unknown',
      year: album.year || 0,
      songs: (album.songs || []).map((song: any) => ({
        id: song.id,
        title: song.title,
        artist: song.artist || album.artist || 'Unknown Artist',
        diskNumber: album.disk_number,
        trackNumber: song.track_number,
        genre: album.genre || 'Unknown',
        albumId: album.id,
        duration: song.duration,
      })).sort((a: Song, b: Song) => a.trackNumber - b.trackNumber),
    }));

    setAlbums(transformedAlbums);
    setLoading(false);
  };

  const genres = useMemo(() => {
    const genreSet = new Set(albums.map(album => album.genre).filter(Boolean));
    return Array.from(genreSet);
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    if (activeGenre) {
      return albums.filter(album => album.genre === activeGenre);
    }
    return albums;
  }, [albums, activeGenre]);

  const allSongs = useMemo(() => {
    return albums.flatMap(album => album.songs);
  }, [albums]);

  // Get unique disc numbers for sorting
  const discNumbers = useMemo(() => {
    const discs = new Set(albums.map(album => album.diskNumber));
    return Array.from(discs).sort((a, b) => a - b);
  }, [albums]);

  // Sort and filter songs based on selected options
  const sortedSongs = useMemo(() => {
    let songs = [...allSongs];
    
    // Filter by disc if selected
    if (songSortBy !== 'all') {
      const discNum = parseInt(songSortBy);
      songs = songs.filter(song => song.diskNumber === discNum);
    }
    
    // Sort based on selected order
    songs.sort((a, b) => {
      if (songSortOrder === 'a-z') {
        // Sort alphabetically by title
        return a.title.localeCompare(b.title);
      } else if (songSortOrder === 'z-a') {
        // Sort reverse alphabetically by title
        return b.title.localeCompare(a.title);
      } else {
        // Sort by disc number, then track number (default)
        if (a.diskNumber !== b.diskNumber) {
          return a.diskNumber - b.diskNumber;
        }
        return a.trackNumber - b.trackNumber;
      }
    });
    
    return songs;
  }, [allSongs, songSortBy, songSortOrder]);

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return [];

    return allSongs.filter(
      song =>
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery)
    );
  }, [allSongs, searchQuery]);

  const isSearching = searchQuery.length > 0;

  // Apply custom bar colors
  useEffect(() => {
    if (bar?.primary_color) {
      document.documentElement.style.setProperty('--primary', bar.primary_color);
    }
    if (bar?.secondary_color) {
      document.documentElement.style.setProperty('--accent', bar.secondary_color);
    }

    return () => {
      // Reset colors when leaving
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--accent');
    };
  }, [bar]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !bar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-heading font-bold mb-2">Bar Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || "We couldn't find the bar you're looking for."}
            </p>
            <Link to="/" className="text-primary hover:underline">
              Go to homepage
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {bar.logo_url ? (
                <img 
                  src={bar.logo_url} 
                  alt={bar.name} 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <span className="font-heading font-bold text-lg text-foreground">
                {bar.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Powered by</p>
              <Link to="/" className="font-heading font-semibold text-sm text-foreground hover:text-primary transition-colors">
                Nam<span className="text-primary">jukes</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {selectedAlbum ? (
          <AlbumDetail 
            album={selectedAlbum} 
            onBack={() => setSelectedAlbum(null)}
            onSongClick={(song) => {
              setSelectedSong(song);
              setDialogOpen(true);
            }}
          />
        ) : (
          <>
            {/* View Toggle and Search */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'albums' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('albums')}
                  >
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Albums
                  </Button>
                  <Button
                    variant={viewMode === 'songs' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('songs')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    All Songs
                  </Button>
                </div>
                {viewMode === 'songs' && (
                  <div className="flex items-center gap-2">
                    <Select value={songSortBy} onValueChange={(value: 'all' | 'disc') => setSongSortBy(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Songs</SelectItem>
                        {discNumbers.map(disc => (
                          <SelectItem key={disc} value={disc.toString()}>
                            Disc {disc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={songSortOrder} onValueChange={(value: 'disc' | 'a-z' | 'z-a') => setSongSortOrder(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disc">By Disc</SelectItem>
                        <SelectItem value="a-z">A-Z</SelectItem>
                        <SelectItem value="z-a">Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search songs, artists, albums..."
              />
            </div>

            {isSearching ? (
              /* Search Results */
              <SongList
                songs={searchResults}
                title={`Search results for "${searchQuery}"`}
                onSongClick={(song) => {
                  setSelectedSong(song);
                  setDialogOpen(true);
                }}
              />
            ) : viewMode === 'songs' ? (
              /* All Songs View - Music Player Style */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold">
                    {songSortBy === 'all' 
                      ? `All Songs (${sortedSongs.length})` 
                      : `Disc ${songSortBy} Songs (${sortedSongs.length})`
                    }
                  </h2>
                </div>
                {sortedSongs.length === 0 ? (
                  <Card className="glass">
                    <CardContent className="p-8 text-center">
                      <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h2 className="text-xl font-heading font-bold mb-2">No Songs Found</h2>
                      <p className="text-muted-foreground">
                        {songSortBy === 'all' 
                          ? "This bar hasn't added any songs yet."
                          : `No songs found for disc ${songSortBy}.`
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <SongList
                    songs={sortedSongs}
                    onSongClick={(song) => {
                      setSelectedSong(song);
                      setDialogOpen(true);
                    }}
                  />
                )}
              </div>
            ) : (
              <>
                {/* Genre Filter */}
                {genres.length > 1 && (
                  <div className="mb-8">
                    <GenreFilter
                      genres={genres}
                      activeGenre={activeGenre}
                      onSelect={setActiveGenre}
                    />
                  </div>
                )}

                {/* Albums Grid */}
                {albums.length === 0 ? (
                  <Card className="glass">
                    <CardContent className="p-8 text-center">
                      <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h2 className="text-xl font-heading font-bold mb-2">No Albums Yet</h2>
                      <p className="text-muted-foreground">
                        This bar hasn't added any albums to their jukebox yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    <h2 className="text-2xl font-heading font-bold mb-6">
                      {activeGenre ? `${activeGenre} Albums` : "All Albums"}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {filteredAlbums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onClick={() => setSelectedAlbum(album)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Tip */}
                {albums.length > 0 && (
                  <div className="mt-12 p-6 rounded-2xl glass border border-primary/30 text-center">
                    <p className="text-muted-foreground">
                      💡 <strong className="text-foreground">Tip:</strong> Look for the big{" "}
                      <span className="text-primary font-bold">Disk</span> and{" "}
                      <span className="text-accent font-bold">Track</span> numbers when you find your song!
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Jukebox Entry Dialog */}
      {selectedSong && (
        <JukeboxEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          song={{
            title: selectedSong.title,
            artist: selectedSong.artist,
            diskNumber: selectedSong.diskNumber,
            trackNumber: selectedSong.trackNumber,
          }}
        />
      )}
    </div>
  );
};

export default BarPage;
