import { Album } from "@/data/mockData";
import { Disc } from "lucide-react";

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(280_100%_65%/0.2)]"
    >
      {/* Album Cover */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={album.cover}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Disk Number Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark border border-primary/30">
          <Disc className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Disk {album.diskNumber}</span>
        </div>
      </div>

      {/* Album Info */}
      <div className="p-4">
        <h3 className="text-lg font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {album.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {album.genre}
          </span>
          <span className="text-xs text-muted-foreground">
            {album.songs.length} tracks
          </span>
        </div>
      </div>
    </button>
  );
};

export default AlbumCard;
