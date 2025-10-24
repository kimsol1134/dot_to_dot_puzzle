/**
 * Image Processing Web Worker
 *
 * Runs the heavy image processing pipeline in a background thread
 * to avoid blocking the main UI thread.
 *
 * Uses OffscreenCanvas and ImageBitmap (not available in iOS Safari 15.x).
 * For iOS Safari, the app falls back to processInMainThread.
 */

import { processImageToPuzzle } from '../lib/image-processing';

self.onmessage = async (e: MessageEvent) => {
  const { imageDataUrl, options } = e.data;

  try {
    // Use the unified pipeline with progress callbacks
    const result = await processImageToPuzzle(imageDataUrl, {
      difficulty: options.difficulty,
      startPosition: options.startPosition,
      onProgress: (progress, message) => {
        self.postMessage({ type: 'progress', progress, message });
      },
    });

    // Send success result
    self.postMessage({
      type: 'success',
      result,
    });
  } catch (error) {
    // Send error
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
};
