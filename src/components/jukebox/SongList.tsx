import { Song } from "@/data/mockData";
import SongRow from "./SongRow";

interface SongListProps {
  songs: Song[];
  title?: string;
  onSongClick?: (song: Song) => void;
}

const SongList = ({ songs, title, onSongClick }: SongListProps) => {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No songs found</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg sm:text-xl font-display font-semibold mb-3 sm:mb-4">{title}</h3>
      )}
      <div className="space-y-2 sm:space-y-2">
        {songs.map((song) => (
          <SongRow 
            key={song.id} 
            song={song} 
            onClick={onSongClick ? () => onSongClick(song) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default SongList;
