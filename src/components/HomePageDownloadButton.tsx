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
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if app was installed before
    if (localStorage.getItem('pwa-installed') === 'true') {
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
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show button even if prompt isn't available yet (it will be enabled when available)
  return (
    <NeonButton 
      variant="hero" 
      size="xl"
      onClick={handleInstall}
      disabled={!deferredPrompt}
    >
      <Download className="w-5 h-5" />
      {deferredPrompt ? 'Download App' : 'Download App'}
    </NeonButton>
  );
}
