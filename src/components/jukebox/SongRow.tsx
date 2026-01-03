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
      className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg sm:rounded-xl border border-border active:border-primary/50 active:bg-primary/5 transition-all touch-manipulation ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
      style={{ minHeight: '64px' }}
    >
      {/* Icon - Hidden on very small screens */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Music className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
      </div>

      {/* Song Info - Takes more space on mobile */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base sm:text-lg text-foreground truncate group-active:text-primary transition-colors">
          {song.title}
        </h4>
        <p className="text-sm sm:text-base text-muted-foreground truncate mt-0.5">{song.artist}</p>
      </div>

      {/* Disk & Track Numbers - Large and Clear - Mobile Optimized */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="text-center">
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Disk</div>
          <div className="text-xl sm:text-2xl font-display font-bold text-primary">
            {song.diskNumber}
          </div>
        </div>
        <div className="w-px h-8 sm:h-10 bg-border" />
        <div className="text-center">
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Track</div>
          <div className="text-xl sm:text-2xl font-display font-bold text-accent">
            {song.trackNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongRow;
