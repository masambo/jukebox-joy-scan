import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Camera, ArrowRight, Loader2 } from 'lucide-react';
import namjukesLogo from '@/assets/namjukes-logo.png';

export function BarScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQRScan = async (file: File) => {
    setScanning(true);
    setError(null);

    try {
      // In a real implementation, you'd use a QR code scanning library
      // For now, we'll extract the URL from the image or use manual input
      // This is a placeholder - you'd integrate with a library like jsQR or html5-qrcode
      
      // For demo purposes, we'll show how to handle it
      // In production, use: import jsQR from 'jsqr' or html5-qrcode
      
      // Simulate QR code reading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, prompt for manual entry if QR scan fails
      alert('QR code scanning requires a library. Please enter the bar URL manually or scan with your camera.');
    } catch (err) {
      setError('Failed to scan QR code. Please try again or enter the URL manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleQRScan(file);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError('Please enter a bar URL or slug');
      return;
    }

    // Extract slug from URL if full URL is provided
    let slug = manualInput.trim();
    if (slug.includes('/bar/')) {
      slug = slug.split('/bar/')[1].split('/')[0].split('?')[0];
    } else if (slug.includes('namjukes.netlify.app')) {
      slug = slug.split('/bar/')[1]?.split('/')[0]?.split('?')[0] || slug;
    }

    if (slug) {
      navigate(`/bar/${slug}`);
    } else {
      setError('Invalid bar URL. Please check and try again.');
    }
  };

  const handleCameraScan = () => {
    // Request camera access and scan QR code
    // This would use the device camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // In production, integrate with html5-qrcode or similar
      alert('Camera scanning requires additional setup. Please use the file upload or manual entry.');
    } else {
      alert('Camera access not available. Please use file upload or manual entry.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-inset">
      <div className="w-full max-w-md">
        <Card className="glass border-border">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <img 
                src={namjukesLogo} 
                alt="Namjukes" 
                className="h-16 w-auto"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading">Welcome to Namjukes</CardTitle>
              <CardDescription className="mt-2">
                Scan a bar's QR code to access their jukebox
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* QR Code Scanner Options */}
            <div className="space-y-3">
              <Button
                onClick={handleCameraScan}
                className="w-full h-14 text-base"
                variant="default"
                disabled={scanning}
              >
                <Camera className="h-5 w-5 mr-2" />
                {scanning ? 'Scanning...' : 'Scan QR Code with Camera'}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-14 text-base"
                variant="outline"
                disabled={scanning}
              >
                <QrCode className="h-5 w-5 mr-2" />
                {scanning ? 'Processing...' : 'Upload QR Code Image'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Enter Bar URL or Slug
                </label>
                <Input
                  type="text"
                  placeholder="e.g., my-bar-name or https://namjukes.netlify.app/bar/my-bar"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                  className="h-12 text-base"
                />
              </div>
              <Button
                onClick={handleManualSubmit}
                className="w-full h-12 text-base"
                disabled={!manualInput.trim() || scanning}
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                💡 Look for the QR code at the bar or ask the staff for the bar's Namjukes link
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
