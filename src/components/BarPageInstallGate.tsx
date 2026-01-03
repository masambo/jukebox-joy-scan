import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import namjukesLogo from '@/assets/namjukes-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface BarPageInstallGateProps {
  onContinue: () => void;
  barName?: string;
}

export function BarPageInstallGate({ onContinue, barName }: BarPageInstallGateProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGate, setShowGate] = useState(true);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      if (isStandalone) {
        setIsInstalled(true);
        setShowGate(false);
        onContinue();
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkStandalone()) {
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Periodically check if app was installed (user might have installed in another tab)
    const interval = setInterval(() => {
      if (checkStandalone()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearInterval(interval);
    };
  }, [onContinue]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no prompt available, show instructions for manual install
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowGate(false);
        onContinue();
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    // Don't allow dismissing - user must install the app
    // Show instructions for manual install
    alert('Please install the Namjukes app to access bar music. Look for the install option in your browser menu.');
  };

  // Don't show gate if already installed or dismissed
  if (!showGate || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 safe-area-inset">
      <Card className="w-full max-w-md border-2 border-primary/50 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src={namjukesLogo} 
                alt="Namjukes" 
                className="h-20 w-auto"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-heading">Install Namjukes App</CardTitle>
            <CardDescription className="mt-2 text-base">
              {barName 
                ? `Get the best experience at ${barName}`
                : 'Get the best jukebox experience'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-bold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Quick Access</p>
                <p>Open instantly from your home screen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-bold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Works Offline</p>
                <p>Browse songs even without internet</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-bold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">App-Like Experience</p>
                <p>No browser bars, just pure music browsing</p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {deferredPrompt ? (
              <Button 
                onClick={handleInstall} 
                className="w-full h-14 text-base font-semibold"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Install App Now
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Install instructions:
                </p>
                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
                  <p><strong>iOS:</strong> Tap Share → Add to Home Screen</p>
                  <p><strong>Android:</strong> Tap Menu → Install App</p>
                  <p><strong>Desktop:</strong> Click Install in address bar</p>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground text-center">
                The app is required to access bar music. Please install to continue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
