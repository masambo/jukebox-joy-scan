import { useState, useMemo } from "react";
import { Music2, Grid3x3, List, Filter, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import SearchBar from "@/components/jukebox/SearchBar";
import GenreFilter from "@/components/jukebox/GenreFilter";
import AlbumCard from "@/components/jukebox/AlbumCard";
import SongList from "@/components/jukebox/SongList";
import AlbumDetail from "@/components/jukebox/AlbumDetail";
import { mockBar, getGenres, searchSongs, filterByGenre, getAllSongs, Album, Song } from "@/data/mockData";
import { JukeboxEntryDialog } from "@/components/jukebox/JukeboxEntryDialog";
import namjukesLogo from "@/assets/namjukes-logo.png";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Demo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'albums' | 'songs'>('albums');
  const [songSortBy, setSongSortBy] = useState<'all' | 'disc'>('all');
  const [songSortOrder, setSongSortOrder] = useState<'disc' | 'a-z' | 'z-a'>('disc');

  const genres = getGenres();

  const filteredAlbums = useMemo(() => {
    if (activeGenre) {
      return filterByGenre(activeGenre);
    }
    return mockBar.albums;
  }, [activeGenre]);

  const searchResults = useMemo(() => {
    return searchSongs(searchQuery);
  }, [searchQuery]);

  const isSearching = searchQuery.length > 0;

  // Get all songs and disc numbers
  const allSongs = useMemo(() => {
    return getAllSongs();
  }, []);

  const discNumbers = useMemo(() => {
    const discs = new Set(allSongs.map(song => song.diskNumber));
    return Array.from(discs).sort((a, b) => a - b);
  }, [allSongs]);

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

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={namjukesLogo} 
                alt="Namjukes" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">You're at</p>
              <p className="font-display font-semibold text-foreground">{mockBar.name}</p>
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
                  <div className="space-y-3">
                    {/* Sort Order - Toggle Buttons */}
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      <ToggleGroup 
                        type="single" 
                        value={songSortOrder} 
                        onValueChange={(value: 'disc' | 'a-z' | 'z-a') => {
                          if (value) setSongSortOrder(value);
                        }}
                        className="flex-1"
                      >
                        <ToggleGroupItem 
                          value="disc" 
                          aria-label="Sort by disc"
                          className="flex-1 h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          By Disc
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="a-z" 
                          aria-label="Sort A-Z"
                          className="flex-1 h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          A-Z
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="z-a" 
                          aria-label="Sort Z-A"
                          className="flex-1 h-10 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          Z-A
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    {/* Disc Filter - Single Dropdown */}
                    {songSortBy !== 'all' || discNumbers.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select value={songSortBy} onValueChange={(value: 'all' | 'disc') => setSongSortBy(value)}>
                          <SelectTrigger className="flex-1 h-10 text-sm">
                            <SelectValue>
                              {songSortBy === 'all' ? 'All Discs' : `Disc ${songSortBy}`}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Discs</SelectItem>
                            {discNumbers.map(disc => (
                              <SelectItem key={disc} value={disc.toString()}>
                                Disc {disc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
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
                  <h2 className="text-2xl font-display font-bold">
                    {songSortBy === 'all' 
                      ? `All Songs (${sortedSongs.length})` 
                      : `Disc ${songSortBy} Songs (${sortedSongs.length})`
                    }
                  </h2>
                </div>
                {sortedSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-display font-bold mb-2">No Songs Found</h2>
                    <p className="text-muted-foreground">
                      {songSortBy === 'all' 
                        ? "No songs available."
                        : `No songs found for disc ${songSortBy}.`
                      }
                    </p>
                  </div>
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
                <div className="mb-8">
                  <GenreFilter
                    genres={genres}
                    activeGenre={activeGenre}
                    onSelect={setActiveGenre}
                  />
                </div>

                {/* Albums Grid */}
                <div>
                  <h2 className="text-2xl font-display font-bold mb-6">
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

                {/* Quick Tip */}
                <div className="mt-12 p-6 rounded-2xl glass-dark border border-primary/30 text-center">
                  <p className="text-muted-foreground">
                    💡 <strong className="text-foreground">Tip:</strong> Look for the big{" "}
                    <span className="text-primary font-bold">Disk</span> and{" "}
                    <span className="text-accent font-bold">Track</span> numbers when you find your song!
                  </p>
                </div>
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

export default Demo;
