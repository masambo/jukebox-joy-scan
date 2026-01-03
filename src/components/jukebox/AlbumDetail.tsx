import { Album, Song } from "@/data/mockData";
import { ArrowLeft, Disc } from "lucide-react";
import SongRow from "./SongRow";
import { NeonButton } from "@/components/ui/NeonButton";

interface AlbumDetailProps {
  album: Album;
  onBack: () => void;
  onSongClick?: (song: Song) => void;
}

const AlbumDetail = ({ album, onBack, onSongClick }: AlbumDetailProps) => {
  return (
    <div>
      {/* Back Button - Mobile Optimized */}
      <button
        onClick={onBack}
        className="mb-4 sm:mb-6 flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg hover:bg-accent/50 active:bg-accent transition-colors touch-manipulation text-foreground"
      >
        <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
        <span className="text-base sm:text-sm font-medium">Back to Albums</span>
      </button>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-48 shrink-0">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-[0_0_40px_hsl(280_100%_65%/0.3)]">
            <img
              src={album.cover || '/namjukes_albumcover.png'}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Disc className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Disk {album.diskNumber}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">{album.title}</h2>
          <p className="text-xl text-muted-foreground mb-4">{album.artist}</p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {album.genre}
            </span>
            <span className="text-muted-foreground">{album.year}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{album.songs.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {album.songs.map((song) => (
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

export default AlbumDetail;
