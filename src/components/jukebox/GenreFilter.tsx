interface GenreFilterProps {
  genres: string[];
  activeGenre: string | null;
  onSelect: (genre: string | null) => void;
}

const GenreFilter = ({ genres, activeGenre, onSelect }: GenreFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeGenre === null
            ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(280_100%_65%/0.5)]"
            : "bg-card border border-border text-foreground hover:border-primary/50"
        }`}
      >
        All Genres
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelect(genre)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeGenre === genre
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(280_100%_65%/0.5)]"
              : "bg-card border border-border text-foreground hover:border-primary/50"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
