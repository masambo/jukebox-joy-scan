import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Camera, ArrowRight, Loader2, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import namjukesLogo from '@/assets/namjukes-logo.png';
import { saveBar } from '@/utils/barStorage';
import { cacheBarData } from '@/utils/offlineStorage';
import { supabase } from '@/integrations/supabase/client';

interface BarScannerProps {
  onBarScanned?: () => void;
}

export function BarScanner({ onBarScanned }: BarScannerProps = {}) {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const extractSlugFromUrl = (url: string): string | null => {
    try {
      // Try to parse as URL first
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/bar/');
      if (pathParts.length > 1) {
        return pathParts[1].split('/')[0].split('?')[0];
      }
    } catch {
      // If not a valid URL, try to extract from string
      if (url.includes('/bar/')) {
        return url.split('/bar/')[1].split('/')[0].split('?')[0];
      }
      // If it's just a slug, return as is
      if (url.trim() && !url.includes('http') && !url.includes('://')) {
        return url.trim();
      }
    }
    return null;
  };

  const navigateToBar = async (urlOrSlug: string) => {
    const slug = extractSlugFromUrl(urlOrSlug);
    if (!slug) {
      setError('Invalid bar URL. Please check and try again.');
      return;
    }

    // Fetch bar data to save it
    try {
      const { data: barData } = await supabase
        .from('bars')
        .select('id, name, slug, logo_url')
        .eq('slug', slug)
        .single();

      if (barData) {
        // Save bar to local storage
        saveBar({
          id: barData.id,
          name: barData.name,
          slug: barData.slug,
          logo_url: barData.logo_url,
        });

        // Fetch and cache albums and songs for offline access
        try {
          const { data: albumsData } = await supabase
            .from('albums')
            .select(`
              *,
              songs (*)
            `)
            .eq('bar_id', barData.id)
            .order('disk_number');

          if (albumsData) {
            // Cache the bar data for offline access
            await cacheBarData(barData.id, barData.slug, barData, albumsData);
          }
        } catch (cacheError) {
          console.error('Error caching bar data:', cacheError);
          // Continue even if caching fails
        }

        // Call callback if provided
        if (onBarScanned) {
          onBarScanned();
        } else {
          // Navigate to bar page
          navigate(`/bar/${slug}`);
        }
      } else {
        setError('Bar not found. Please check the QR code and try again.');
      }
    } catch (err) {
      console.error('Error fetching bar:', err);
      // Still try to navigate even if save fails
      navigate(`/bar/${slug}`);
    }
  };

  const handleQRScanFromFile = async (file: File) => {
    setScanning(true);
    setError(null);

    try {
      // Create a temporary container for scanning if it doesn't exist
      let scanContainer = document.getElementById(qrCodeRegionId);
      if (!scanContainer) {
        scanContainer = document.createElement('div');
        scanContainer.id = qrCodeRegionId;
        scanContainer.style.display = 'none';
        document.body.appendChild(scanContainer);
      }

      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      
      const result = await html5QrCode.scanFile(file, true);
      
      // Clean up
      await html5QrCode.clear();
      
      if (result) {
        navigateToBar(result);
      } else {
        setError('No QR code found in the image. Please try another image.');
      }
    } catch (err: unknown) {
      console.error('QR scan error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('No QR code found') || errorMessage.includes('NotFoundException')) {
        setError('No QR code found in the image. Please try another image.');
      } else {
        setError('Failed to scan QR code. Please try again or enter the URL manually.');
      }
    } finally {
      setScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleQRScanFromFile(file);
    }
  };

  const handleCameraScan = async () => {
    setError(null);
    setCameraOpen(true);
    setIsScanning(true); // Set scanning state immediately
    
    try {
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        // Use the first available camera (usually the back camera)
        const cameraId = devices[devices.length - 1].id; // Use last camera (usually back camera)
        setCameraId(cameraId);
        
        // Wait for dialog to render and ensure element exists
        setTimeout(async () => {
          try {
            // Ensure the QR code region exists
            const qrRegion = document.getElementById(qrCodeRegionId);
            if (!qrRegion) {
              setError('Scanner container not found. Please try again.');
              setIsScanning(false);
              setCameraOpen(false);
              return;
            }

            const html5QrCode = new Html5Qrcode(qrCodeRegionId);
            scannerRef.current = html5QrCode;
            
            await html5QrCode.start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              (decodedText) => {
                // Successfully scanned
                html5QrCode.stop().then(() => {
                  setIsScanning(false);
                  setCameraOpen(false);
                  navigateToBar(decodedText);
                }).catch((err) => {
                  console.error('Error stopping scanner:', err);
                  setIsScanning(false);
                  setCameraOpen(false);
                  navigateToBar(decodedText);
                });
              },
              (errorMessage) => {
                // Ignore scanning errors (they're normal while looking for QR code)
                // Only log for debugging, don't set error state
                console.debug('QR scan error (normal):', errorMessage);
              }
            );
          } catch (err: unknown) {
            console.error('Camera start error:', err);
            setError('Failed to start camera. Please check permissions and try again.');
            setIsScanning(false);
            setCameraOpen(false);
          }
        }, 500); // Increased timeout for better reliability
      } else {
        setError('No camera found. Please use file upload or manual entry.');
        setIsScanning(false);
        setCameraOpen(false);
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please check permissions or use file upload.');
      setIsScanning(false);
      setCameraOpen(false);
    }
  };

  const stopCamera = async () => {
    setIsScanning(false);
    
    // Stop the camera stream first
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
        // Try to clear anyway
        try {
          await scannerRef.current.clear();
        } catch (clearErr) {
          console.error('Error clearing scanner:', clearErr);
        }
      }
      scannerRef.current = null;
    }
    
    // Close the dialog after a brief delay to ensure camera is stopped
    setTimeout(() => {
      setCameraOpen(false);
      setCameraId(null);
    }, 100);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError('Please enter a bar URL or slug');
      return;
    }

    navigateToBar(manualInput.trim());
  };

  const handleClose = () => {
    // If onBarScanned callback exists, use it to close scanner
    // Otherwise navigate to /bars
    if (onBarScanned) {
      onBarScanned();
    } else {
      navigate('/bars');
    }
  };

  return (
    <>
      {/* Close Button - Fixed position for maximum clickability */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-[9999] text-muted-foreground hover:text-foreground h-12 w-12 flex items-center justify-center rounded-full bg-background/95 backdrop-blur-sm border-2 border-border hover:bg-accent hover:border-primary transition-all shadow-xl cursor-pointer"
        type="button"
        aria-label="Close scanner"
      >
        <X className="h-6 w-6" />
      </button>

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
                  disabled={scanning || cameraOpen}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {scanning ? 'Scanning...' : 'Scan QR Code with Camera'}
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-14 text-base"
                  variant="outline"
                  disabled={scanning || cameraOpen}
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
                    disabled={scanning || cameraOpen}
                  />
                </div>
                <Button
                  onClick={handleManualSubmit}
                  className="w-full h-12 text-base"
                  disabled={!manualInput.trim() || scanning || cameraOpen}
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

      {/* Camera Scanner Dialog */}
      <Dialog open={cameraOpen} onOpenChange={(open) => {
        if (!open) {
          stopCamera();
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle>Scan QR Code</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopCamera}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-4">
            <div id={qrCodeRegionId} className="w-full rounded-lg overflow-hidden bg-black min-h-[300px] flex items-center justify-center relative">
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="ml-2 text-white">Starting camera...</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              {isScanning ? 'Point your camera at the QR code' : 'Preparing camera...'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
