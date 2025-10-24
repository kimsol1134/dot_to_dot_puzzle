/**
 * Puzzle Generation Hook with Automatic Fallback
 *
 * Automatically detects browser capabilities and uses:
 * - Web Worker (Chrome, Firefox, Safari 16.4+)
 * - Main thread fallback (iOS Safari 15.x)
 *
 * The hook manages the worker lifecycle and provides progress updates.
 */

'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { usePuzzleStore } from '@/stores/usePuzzleStore';
import { getRecommendedStrategy } from '@/lib/utils/feature-detection';
import { processInMainThread } from '@/lib/image-processing/main-thread-processor';

export function usePuzzleGeneration() {
  const workerRef = useRef<Worker | null>(null);
  const [strategy, setStrategy] = useState<'worker' | 'main-thread'>('worker');
  const [showWarning, setShowWarning] = useState(false);
  const { setPoints, setGenerating, setProgress, setError } = usePuzzleStore();

  // Detect browser capabilities on mount
  useEffect(() => {
    const detectedStrategy = getRecommendedStrategy();
    setStrategy(detectedStrategy);

    if (detectedStrategy === 'main-thread') {
      setShowWarning(true);
      console.warn('⚠️ iOS Safari detected: Using main-thread fallback (slower performance)');
    }
  }, []);

  const generatePuzzle = useCallback(async (
    imageDataUrl: string,
    options: { difficulty: number; startPosition: 'top-left' | 'top-right' | 'center' }
  ) => {
    setGenerating(true);
    setError(null);
    setProgress(0);

    try {
      if (strategy === 'worker') {
        // Worker path (Chrome, Firefox, Safari 16.4+)
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL('../workers/image-processor.worker.ts', import.meta.url),
            { type: 'module' }
          );
        }

        const worker = workerRef.current;

        const result = await new Promise<any>((resolve, reject) => {
          worker.onmessage = (e: MessageEvent) => {
            const { type, progress, result, error } = e.data;

            if (type === 'progress') {
              setProgress(progress);
            } else if (type === 'success') {
              resolve(result);
            } else if (type === 'error') {
              reject(new Error(error));
            }
          };

          worker.onerror = (error) => {
            reject(error);
          };

          worker.postMessage({ imageDataUrl, options });
        });

        setPoints(result.points, result.originalSize);
      } else {
        // Main thread fallback (iOS Safari 15.x and below)
        const result = await processInMainThread(
          imageDataUrl,
          options,
          (progress, message) => setProgress(progress)
        );

        setPoints(result.points, result.originalSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '퍼즐 생성 실패');
    } finally {
      setGenerating(false);
    }
  }, [strategy, setPoints, setGenerating, setProgress, setError]);

  return { generatePuzzle, strategy, showWarning };
}
