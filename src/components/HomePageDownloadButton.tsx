import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function HomePageDownloadButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Only check standalone mode - not localStorage (since it persists after uninstall)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    };

    // Check immediately
    checkInstalled();

    // Check periodically in case app gets installed/uninstalled
    const interval = setInterval(checkInstalled, 1000);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If prompt is available, app is not installed (or was uninstalled)
      setIsInstalled(false);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearInterval(interval);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no prompt available, show instructions
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        alert('To install on iOS:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
      } else if (navigator.userAgent.includes('Android')) {
        alert('To install on Android:\n1. Tap the menu (⋮)\n2. Tap "Install app" or "Add to Home screen"');
      } else {
        alert('To install:\nLook for the install icon in your browser\'s address bar and click it.');
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        // Prompt is consumed, clear it
        setDeferredPrompt(null);
        // Check if app is now in standalone mode
        setTimeout(() => {
          const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
          setIsInstalled(standalone);
        }, 500);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  // Always show the button
  return (
    <NeonButton 
      variant="hero" 
      size="xl"
      onClick={handleInstall}
      disabled={false}
    >
      <Download className="w-5 h-5" />
      {isInstalled ? 'App Installed ✓' : (deferredPrompt ? 'Download App' : 'Download App')}
    </NeonButton>
  );
}
