import { useState, useMemo } from "react";
import { Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import SearchBar from "@/components/jukebox/SearchBar";
import GenreFilter from "@/components/jukebox/GenreFilter";
import AlbumCard from "@/components/jukebox/AlbumCard";
import SongList from "@/components/jukebox/SongList";
import AlbumDetail from "@/components/jukebox/AlbumDetail";
import { mockBar, getGenres, searchSongs, filterByGenre, Album } from "@/data/mockData";

const Demo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

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

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">
                Nam<span className="text-primary">jukes</span>
              </span>
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
          <AlbumDetail album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
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
              />
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
    </div>
  );
};

export default Demo;
