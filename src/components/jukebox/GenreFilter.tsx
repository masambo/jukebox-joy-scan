interface GenreFilterProps {
  genres: string[];
  activeGenre: string | null;
  onSelect: (genre: string | null) => void;
}

const GenreFilter = ({ genres, activeGenre, onSelect }: GenreFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2.5 sm:py-2 rounded-full text-sm sm:text-sm font-medium transition-all touch-manipulation active:scale-95 min-h-[44px] ${
          activeGenre === null
            ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(280_100%_65%/0.5)]"
            : "bg-card border border-border text-foreground active:border-primary/50"
        }`}
      >
        All Genres
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelect(genre)}
          className={`px-4 py-2.5 sm:py-2 rounded-full text-sm sm:text-sm font-medium transition-all touch-manipulation active:scale-95 min-h-[44px] ${
            activeGenre === genre
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(280_100%_65%/0.5)]"
              : "bg-card border border-border text-foreground active:border-primary/50"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
