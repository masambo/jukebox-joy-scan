import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Disc, Music } from "lucide-react";
import { useState } from "react";

interface JukeboxEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: {
    title: string;
    artist: string;
    diskNumber: number;
    trackNumber: number;
  };
}

export function JukeboxEntryDialog({ open, onOpenChange, song }: JukeboxEntryDialogProps) {
  const [discEntered, setDiscEntered] = useState(false);
  const [trackEntered, setTrackEntered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleDiscEnter = () => {
    setDiscEntered(true);
    // If both are entered, show completion
    if (trackEntered) {
      handleComplete();
    }
  };

  const handleTrackEnter = () => {
    setTrackEntered(true);
    // If both are entered, show completion
    if (discEntered) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    // Auto close after showing completion
    setTimeout(() => {
      onOpenChange(false);
      // Reset state after closing
      setTimeout(() => {
        setDiscEntered(false);
        setTrackEntered(false);
        setIsComplete(false);
      }, 300);
    }, 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after closing
    setTimeout(() => {
      setDiscEntered(false);
      setTrackEntered(false);
      setIsComplete(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Enter Song on Jukebox</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Song Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{song.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{song.artist}</p>
          </div>

          {isComplete ? (
            /* Completion Message */
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">🎵</div>
              <p className="text-lg font-semibold text-green-600">
                Song queued successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Your song will play on the jukebox
              </p>
            </div>
          ) : (
            /* Both Steps Displayed Together */
            <div className="space-y-6">
              {/* Disc Number Section */}
              <div className="text-center space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {discEntered ? 'Disc Entered ✓' : 'Enter Disc Number'}
                </div>
                <div className="relative inline-block">
                  <div className={`text-6xl font-display font-bold transition-all ${
                    discEntered 
                      ? 'text-green-500' 
                      : 'text-primary text-glow'
                  }`}>
                    {song.diskNumber}
                  </div>
                  {discEntered && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleDiscEnter}
                  disabled={discEntered}
                  className={`w-full ${
                    discEntered 
                      ? 'bg-green-500 hover:bg-green-500 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/90'
                  } text-primary-foreground`}
                  size="lg"
                >
                  <Disc className="h-5 w-5 mr-2" />
                  {discEntered ? `Disc ${song.diskNumber} Entered ✓` : `Enter Disc ${song.diskNumber}`}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">THEN</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Track Number Section */}
              <div className="text-center space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {trackEntered ? 'Track Entered ✓' : 'Enter Track Number'}
                </div>
                <div className="relative inline-block">
                  <div className={`text-5xl font-display font-bold transition-all ${
                    trackEntered 
                      ? 'text-green-500' 
                      : 'text-accent text-glow-accent'
                  }`}>
                    {song.trackNumber}
                  </div>
                  {trackEntered && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleTrackEnter}
                  disabled={trackEntered}
                  className={`w-full font-bold ${
                    trackEntered 
                      ? 'bg-green-500 hover:bg-green-500 cursor-not-allowed' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-yellow-950`}
                  size="lg"
                >
                  {trackEntered ? `Track ${song.trackNumber} Entered ✓` : `Enter Track ${song.trackNumber}`}
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Enter both disc and track numbers on the jukebox
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
