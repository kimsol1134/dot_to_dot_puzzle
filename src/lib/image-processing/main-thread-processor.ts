/**
 * Main Thread Fallback Processor
 *
 * For browsers that don't support OffscreenCanvas/ImageBitmap (iOS Safari 15.x).
 * Uses HTMLImageElement and document.createElement('canvas') instead.
 *
 * This runs on the main thread, so it may block the UI for large images.
 * See ARCHITECTURE.md for browser compatibility details.
 */

import { grayscaleConversion } from './grayscale';
import { cannyEdgeDetection } from './edge-detection';
import { extractContours } from './contour-extraction';
import { placePoints } from './point-placement';
import { assignNumbers } from './numbering';

export async function processInMainThread(
  imageDataUrl: string,
  options: { difficulty: number; startPosition: 'top-left' | 'top-right' | 'center' },
  onProgress?: (progress: number, message: string) => void
) {
  // 1. Load image using HTMLImageElement
  onProgress?.(10, '이미지 로드 중...');
  const img = await loadImageInMainThread(imageDataUrl);
  const originalSize = { width: img.width, height: img.height };

  // 2. Use document.createElement('canvas') for DOM environment
  onProgress?.(20, '이미지 준비 중...');
  const canvas = document.createElement('canvas');
  const maxSize = 1000;
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

  canvas.width = Math.floor(img.width * scale);
  canvas.height = Math.floor(img.height * scale);

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 3. Grayscale conversion
  onProgress?.(30, '이미지 분석 중...');
  const grayData = grayscaleConversion(imageData);

  // 4. Canny edge detection
  onProgress?.(50, '윤곽 찾는 중...');
  const edgeData = cannyEdgeDetection(grayData);

  // 5. Contour extraction (longest contour only)
  onProgress?.(60, '선 추출 중...');
  const contours = extractContours(edgeData);

  // 6. Point placement (Douglas-Peucker simplification)
  onProgress?.(70, '점 배치 중...');
  const rawPoints = placePoints(contours, options.difficulty);

  // 7. Point numbering (array rotation to set start position)
  onProgress?.(90, '번호 매기는 중...');
  const points = assignNumbers(rawPoints, options.startPosition);

  onProgress?.(100, '완료!');

  // Scale coordinates back to original size
  const scaledPoints = points.map(p => ({
    ...p,
    x: p.x / scale,
    y: p.y / scale,
  }));

  return { points: scaledPoints, originalSize };
}

function loadImageInMainThread(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
