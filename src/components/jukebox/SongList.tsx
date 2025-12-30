import { Song } from "@/data/mockData";
import SongRow from "./SongRow";

interface SongListProps {
  songs: Song[];
  title?: string;
}

const SongList = ({ songs, title }: SongListProps) => {
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
        <h3 className="text-xl font-display font-semibold mb-4">{title}</h3>
      )}
      <div className="space-y-2">
        {songs.map((song) => (
          <SongRow key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default SongList;
