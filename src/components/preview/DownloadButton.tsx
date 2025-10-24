/**
 * Download Button Component
 *
 * Generates high-resolution PNG (A4 @ 300 DPI = 2480x3508px) and triggers download:
 * - Creates in-memory canvas with high resolution
 * - Draws all points with same logic as preview (scaled up)
 * - Exports as PNG blob
 * - Downloads with timestamp filename
 */

'use client';

import { Button } from '@/components/ui/button';
import { usePuzzleStore } from '@/stores/usePuzzleStore';
import { Download } from 'lucide-react';

export default function DownloadButton() {
  const { points, originalSize } = usePuzzleStore();

  if (points.length === 0) return null;

  const handleDownload = () => {
    // Create high-resolution canvas (A4 @ 300 DPI)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // A4 size at 300 DPI
    canvas.width = 2480;
    canvas.height = 3508;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale with margins
    const margin = 200;
    const availableWidth = canvas.width - 2 * margin;
    const availableHeight = canvas.height - 2 * margin;

    const scale = Math.min(
      availableWidth / originalSize.width,
      availableHeight / originalSize.height
    );

    const scaledWidth = originalSize.width * scale;
    const scaledHeight = originalSize.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Draw points (same logic as preview, but larger)
    points.forEach((point) => {
      const x = point.x * scale + offsetX;
      const y = point.y * scale + offsetY;

      // Draw dot (larger for print)
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();

      // Draw number (larger for print)
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.number.toString(), x + 20, y - 10);

      // Highlight point #1 with red circle
      if (point.number === 1) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `puzzle-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <Button onClick={handleDownload} size="lg" className="w-full gap-2">
      <Download className="w-5 h-5" />
      PNG 다운로드
    </Button>
  );
}
