import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
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
          <Button 
            onClick={handleInstall} 
            className="w-full h-14 text-base font-semibold"
            size="lg"
            disabled={!deferredPrompt}
          >
            <Download className="h-5 w-5 mr-2" />
            Install App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
