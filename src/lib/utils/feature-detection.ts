/**
 * Browser Feature Detection
 *
 * Detects support for Web Worker APIs (OffscreenCanvas, ImageBitmap).
 * iOS Safari 15.x doesn't support these, so we need main-thread fallback.
 *
 * See ARCHITECTURE.md browser compatibility matrix for details.
 */

export interface FeatureSupport {
  offscreenCanvas: boolean;
  createImageBitmap: boolean;
  webWorker: boolean;
  canUseWorkerPipeline: boolean;
}

export function detectFeatures(): FeatureSupport {
  const offscreenCanvas = typeof OffscreenCanvas !== 'undefined';
  const createImageBitmap = typeof self.createImageBitmap === 'function';
  const webWorker = typeof Worker !== 'undefined';

  return {
    offscreenCanvas,
    createImageBitmap,
    webWorker,
    // Worker pipeline requires all 3 features
    canUseWorkerPipeline: offscreenCanvas && createImageBitmap && webWorker,
  };
}

export function getRecommendedStrategy(): 'worker' | 'main-thread' {
  // Force main-thread mode during E2E tests to avoid Turbopack Worker bundling issues
  if (typeof window !== 'undefined' && window.location.search.includes('e2e-test-mode')) {
    console.log('🧪 E2E test mode detected: forcing main-thread execution');
    return 'main-thread';
  }

  const features = detectFeatures();

  if (features.canUseWorkerPipeline) {
    return 'worker';
  }

  // iOS Safari and other browsers without OffscreenCanvas support
  console.warn('OffscreenCanvas not supported, falling back to main thread');
  return 'main-thread';
}
