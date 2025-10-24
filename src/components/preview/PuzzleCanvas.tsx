/**
 * Puzzle Canvas Preview Component
 *
 * Renders the generated puzzle points on a canvas:
 * - A4 proportions (600x848px preview)
 * - Points as black dots with numbers
 * - Point #1 highlighted with red circle
 * - Centered with margins
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePuzzleStore } from '@/stores/usePuzzleStore';

export default function PuzzleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { points, originalSize } = usePuzzleStore();

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // A4 proportions (portrait)
    const canvasWidth = 600;
    const canvasHeight = 848;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate scale to fit image within canvas (with margins)
    const margin = 50;
    const availableWidth = canvasWidth - 2 * margin;
    const availableHeight = canvasHeight - 2 * margin;

    const scale = Math.min(
      availableWidth / originalSize.width,
      availableHeight / originalSize.height
    );

    const scaledWidth = originalSize.width * scale;
    const scaledHeight = originalSize.height * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = (canvasHeight - scaledHeight) / 2;

    // Draw points
    points.forEach((point) => {
      const x = point.x * scale + offsetX;
      const y = point.y * scale + offsetY;

      // Draw dot
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw number
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.number.toString(), x + 8, y - 5);

      // Highlight point #1 with red circle
      if (point.number === 1) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [points, originalSize]);

  if (points.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <canvas ref={canvasRef} className="w-full h-auto" />
    </div>
  );
}
