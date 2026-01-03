import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show manual instructions
      alert('To install:\n\niOS: Tap Share → Add to Home Screen\nAndroid: Tap Menu → Install App\nDesktop: Click Install in address bar');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  if (isInstalled) {
    return (
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-green-500/50 bg-green-500/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">App Installed!</h2>
              <p className="text-muted-foreground">
                You can now access Namjukes from your home screen
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-[0_0_40px_hsl(280_100%_65%/0.5)]">
              <Smartphone className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Download the Namjukes App
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Install our app for the best jukebox experience. Scan bars, save favorites, and access music offline.
            </p>
          </div>

          <Card className="glass border-2 border-primary/50 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-bold mb-4">Why Install?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Quick Access</p>
                        <p className="text-sm text-muted-foreground">Open instantly from home screen</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Works Offline</p>
                        <p className="text-sm text-muted-foreground">Browse songs without internet</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Save Multiple Bars</p>
                        <p className="text-sm text-muted-foreground">Access all your favorite bars</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">App-Like Experience</p>
                        <p className="text-sm text-muted-foreground">No browser bars, pure music</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Install Button */}
                <div className="text-center space-y-4">
                  {deferredPrompt ? (
                    <Button
                      onClick={handleInstall}
                      className="w-full h-16 text-lg font-semibold"
                      size="lg"
                    >
                      <Download className="h-6 w-6 mr-2" />
                      Install App Now
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Install instructions:
                      </p>
                      <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted rounded-lg text-left">
                        <p><strong>iOS:</strong> Tap Share → Add to Home Screen</p>
                        <p><strong>Android:</strong> Tap Menu → Install App</p>
                        <p><strong>Desktop:</strong> Click Install in address bar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InstallSection;
