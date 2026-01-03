import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import namjukesLogo from '@/assets/namjukes-logo.png';

interface BarQRCodeProps {
  url: string;
  barId: string;
  barSlug: string;
  barName?: string;
  size?: number;
}

export function BarQRCode({ url, barId, barSlug, barName, size = 300 }: BarQRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    // Generate QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=1`;
    setQrImageUrl(qrUrl);
  }, [url, size]);

  const handlePrint = () => {
    if (!containerRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${barName || 'Bar'} QR Code</title>
          <style>
            @media print {
              @page {
                margin: 20mm;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              background: white;
              padding: 20px;
              border-radius: 8px;
            }
            .qr-code {
              width: ${size}px;
              height: ${size}px;
              margin: 0 auto 20px;
              position: relative;
              background: white;
              padding: 10px;
              border-radius: 8px;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .logo-overlay {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${size * 0.2}px;
              height: ${size * 0.2}px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 5px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .logo-overlay img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .bar-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .bar-id {
              font-size: 14px;
              color: #666;
              margin-top: 10px;
            }
            .bar-id-label {
              font-size: 12px;
              color: #666;
            }
            .bar-id-value {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${barName ? `<div class="bar-name">${barName}</div>` : ''}
            <div class="qr-code">
              <img src="${qrImageUrl}" alt="QR Code" onload="this.style.display='block'" />
              <div class="logo-overlay">
                <img src="${window.location.origin}${namjukesLogo}" alt="Namjukes Logo" />
              </div>
            </div>
            <div class="bar-id">
              <div class="bar-id-label">Bar ID:</div>
              <div class="bar-id-value">${barSlug}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(qrCodeHtml);
    printWindow.document.close();
    
    // Wait for images to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const handleDownload = () => {
    if (!containerRef.current) return;
    
    // Create a temporary canvas to render the QR code with logo
    const canvas = document.createElement('canvas');
    const padding = barName ? 80 : 40;
    canvas.width = size;
    canvas.height = size + padding;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load QR code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);

      // Load and draw logo
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = size * 0.2;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw white circle background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        // Draw text
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        let yOffset = size + 8;
        
        if (barName) {
          ctx.font = 'bold 18px Arial';
          ctx.fillText(barName, size / 2, yOffset);
          yOffset += 28;
        }
        
        ctx.font = '12px Arial';
        ctx.fillText('Bar ID:', size / 2, yOffset);
        yOffset += 18;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(barSlug, size / 2, yOffset);

        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${barSlug}-qr-code.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      logoImg.src = namjukesLogo;
    };
    qrImg.src = qrImageUrl;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <div className="relative bg-white p-4 rounded-lg shadow-lg" style={{ width: size, height: size }}>
        <img 
          src={qrImageUrl} 
          alt="QR Code" 
          className="w-full h-full object-contain"
          onLoad={() => setQrLoaded(true)}
          style={{ display: qrLoaded ? 'block' : 'none' }}
        />
        {qrLoaded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center p-1 shadow-md">
            <img 
              src={namjukesLogo} 
              alt="Namjukes Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {!qrLoaded && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-muted-foreground">Loading QR code...</div>
          </div>
        )}
      </div>
      
      {/* Bar Name and ID */}
      <div className="mt-4 text-center">
        {barName && (
          <div className="text-xl font-bold mb-2">{barName}</div>
        )}
        <div className="text-sm text-muted-foreground">
          <div>Bar ID:</div>
          <div className="font-mono font-bold text-base text-foreground">{barSlug}</div>
        </div>
      </div>

      {/* Print and Download Buttons */}
      <div className="flex gap-2 mt-4">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
