/**
 * Main Image Processing Pipeline (Web Worker)
 *
 * This runs inside a Web Worker, so it uses OffscreenCanvas and ImageBitmap
 * instead of DOM APIs (HTMLImageElement, document.createElement).
 *
 * Pipeline:
 * 1. Load image (ImageBitmap)
 * 2. Draw to OffscreenCanvas with size limits (max 1000px)
 * 3. Grayscale conversion
 * 4. Canny edge detection
 * 5. Contour extraction (longest contour only)
 * 6. Point placement (Douglas-Peucker with difficulty adjustment)
 * 7. Point numbering (array rotation from start position)
 */

import { grayscaleConversion } from './grayscale';
import { cannyEdgeDetection } from './edge-detection';
import { extractContours } from './contour-extraction';
import { placePoints } from './point-placement';
import { assignNumbers } from './numbering';

export interface ProcessingOptions {
  difficulty: number; // 0-100
  startPosition: 'top-left' | 'top-right' | 'center';
  onProgress?: (progress: number, message: string) => void;
}

export interface Point {
  x: number;
  y: number;
  number: number;
}

export async function processImageToPuzzle(
  imageDataUrl: string,
  options: ProcessingOptions
): Promise<{ points: Point[]; originalSize: { width: number; height: number } }> {
  const { difficulty, startPosition, onProgress } = options;

  // 1. Load image (Worker environment uses ImageBitmap)
  onProgress?.(10, '이미지 로드 중...');
  const img = await loadImageInWorker(imageDataUrl);
  const originalSize = { width: img.width, height: img.height };

  // 2. Draw to OffscreenCanvas
  onProgress?.(20, '이미지 준비 중...');

  // Size limit for performance and memory (max 600px on longest side)
  // Reduced from 1000px to prevent OOM errors in contour extraction
  const maxSize = 400;
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

  const canvas = new OffscreenCanvas(
    Math.floor(img.width * scale),
    Math.floor(img.height * scale)
  );
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
  const rawPoints = placePoints(contours, difficulty);

  // 7. Point numbering (array rotation to set start position)
  onProgress?.(90, '번호 매기는 중...');
  const points = assignNumbers(rawPoints, startPosition);

  onProgress?.(100, '완료!');

  // Scale coordinates back to original size
  const scaledPoints = points.map(p => ({
    ...p,
    x: p.x / scale,
    y: p.y / scale,
  }));

  return { points: scaledPoints, originalSize };
}

/**
 * Load image in Worker environment using ImageBitmap
 * (Cannot use HTMLImageElement in Worker)
 */
function loadImageInWorker(dataUrl: string): Promise<ImageBitmap> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob));
}
