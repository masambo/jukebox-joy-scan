import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Trash2, Music2, Plus } from 'lucide-react';
import { getSavedBars, removeBar, SavedBar, isBarSaved } from '@/utils/barStorage';
import namjukesLogo from '@/assets/namjukes-logo.png';
import { BarScanner } from './BarScanner';

export function BarSelector() {
  const navigate = useNavigate();
  const [savedBars, setSavedBars] = useState<SavedBar[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadBars();
  }, []);

  const loadBars = () => {
    const bars = getSavedBars();
    setSavedBars(bars);
  };

  const handleBarSelect = (slug: string) => {
    // Only allow access to bars that were scanned (saved)
    if (isBarSaved(slug)) {
      navigate(`/bar/${slug}`);
    } else {
      alert('This bar must be scanned first. Please scan the QR code to add it to your list.');
    }
  };

  const handleRemoveBar = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    if (confirm('Remove this bar from your list?')) {
      await removeBar(slug);
      loadBars();
    }
  };

  if (showScanner) {
    return <BarScanner onBarScanned={() => {
      setShowScanner(false);
      loadBars();
    }} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 safe-area-inset">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={namjukesLogo} 
              alt="Namjukes" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Bars</h1>
          <p className="text-muted-foreground">
            Select a bar to browse their jukebox
          </p>
        </div>

        {/* Scan New Bar Button */}
        <Button
          onClick={() => setShowScanner(true)}
          className="w-full h-16 text-base font-semibold mb-6"
          size="lg"
        >
          <QrCode className="h-5 w-5 mr-2" />
          Scan New Bar
        </Button>

        {/* Saved Bars List */}
        {savedBars.length === 0 ? (
          <Card className="glass border-border">
            <CardContent className="p-12 text-center">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-heading font-bold mb-2">No Bars Yet</h2>
              <p className="text-muted-foreground mb-6">
                Scan a bar's QR code to get started
              </p>
              <Button
                onClick={() => setShowScanner(true)}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Scan Your First Bar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedBars.map((bar) => (
              <Card
                key={bar.slug}
                className="glass border-border hover:border-primary/50 transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => handleBarSelect(bar.slug)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Bar Logo/Icon */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                      {bar.logo_url ? (
                        <img
                          src={bar.logo_url}
                          alt={bar.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Music2 className="h-8 w-8 text-primary-foreground" />
                      )}
                    </div>

                    {/* Bar Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground truncate">
                        {bar.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Last accessed {new Date(bar.lastAccessed || bar.scannedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemoveBar(e, bar.slug)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
