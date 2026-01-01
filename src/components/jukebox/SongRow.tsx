import { Song } from "@/data/mockData";
import { Music } from "lucide-react";

interface SongRowProps {
  song: Song;
  onClick?: () => void;
}

const SongRow = ({ song, onClick }: SongRowProps) => {
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(280_100%_65%/0.15)] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Music className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {song.title}
        </h4>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>

      {/* Disk & Track Numbers - Large and Clear */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Disk</div>
          <div className="text-2xl font-display font-bold text-primary text-glow">
            {song.diskNumber}
          </div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Track</div>
          <div className="text-2xl font-display font-bold text-accent text-glow-accent">
            {song.trackNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongRow;
