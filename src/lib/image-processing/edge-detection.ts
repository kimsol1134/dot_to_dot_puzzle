/**
 * Canny Edge Detection Algorithm
 *
 * This implementation uses Canny instead of Sobel because Canny removes noise
 * and focuses on main outlines, making it ideal for children's dot-to-dot puzzles.
 * Sobel would detect too many internal details (eyes, nose, mouth) which would
 * make the puzzle too complex for 4-year-olds.
 *
 * Pipeline:
 * 1. Gaussian Blur - Remove noise
 * 2. Sobel Gradient - Calculate edge strength and direction
 * 3. Non-Maximum Suppression - Thin edges to 1 pixel width
 * 4. Double Threshold - Classify edges as strong/weak/non-edge
 * 5. Edge Tracking by Hysteresis - Connect weak edges to strong edges
 */

export function cannyEdgeDetection(imageData: ImageData): ImageData {
  const { width, height } = imageData;

  // 1. Gaussian Blur (노이즈 제거)
  const blurred = gaussianBlur(imageData, 1.4);

  // 2. Sobel 그라디언트 계산
  const { magnitude, direction } = computeGradient(blurred);

  // 3. Non-maximum Suppression (가장 강한 엣지만 남김)
  const suppressed = nonMaxSuppression(magnitude, direction, width, height);

  // 4. Double Threshold (강한 엣지 / 약한 엣지 구분)
  const thresholded = doubleThreshold(suppressed, width, height, 50, 100);

  // 5. Edge Tracking by Hysteresis (연결된 엣지만 유지)
  const edges = edgeTrackingHysteresis(thresholded, width, height);

  return edges;
}

function gaussianBlur(imageData: ImageData, sigma: number): ImageData {
  // 5x5 Gaussian 커널
  const { data, width, height } = imageData;
  const blurred = new ImageData(width, height);

  const kernel = [
    [2, 4, 5, 4, 2],
    [4, 9, 12, 9, 4],
    [5, 12, 15, 12, 5],
    [4, 9, 12, 9, 4],
    [2, 4, 5, 4, 2],
  ];

  const kernelSum = 159;

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let sum = 0;

      for (let ky = 0; ky < 5; ky++) {
        for (let kx = 0; kx < 5; kx++) {
          const pixelIndex = ((y + ky - 2) * width + (x + kx - 2)) * 4;
          sum += data[pixelIndex] * kernel[ky][kx];
        }
      }

      const blurredValue = sum / kernelSum;
      const index = (y * width + x) * 4;
      blurred.data[index] = blurredValue;
      blurred.data[index + 1] = blurredValue;
      blurred.data[index + 2] = blurredValue;
      blurred.data[index + 3] = 255;
    }
  }

  return blurred;
}

function computeGradient(imageData: ImageData): {
  magnitude: Float32Array;
  direction: Float32Array;
} {
  const { data, width, height } = imageData;
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[pixelIndex];
          const kernelIndex = (ky + 1) * 3 + (kx + 1);

          gx += gray * sobelX[kernelIndex];
          gy += gray * sobelY[kernelIndex];
        }
      }

      const index = y * width + x;
      magnitude[index] = Math.sqrt(gx * gx + gy * gy);
      direction[index] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

function nonMaxSuppression(
  magnitude: Float32Array,
  direction: Float32Array,
  width: number,
  height: number
): Float32Array {
  const result = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;
      const angle = direction[index];
      const mag = magnitude[index];

      // 그라디언트 방향에 따라 이웃 픽셀 선택
      let neighbor1, neighbor2;

      if ((angle >= -Math.PI / 8 && angle < Math.PI / 8) ||
          (angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8)) {
        neighbor1 = magnitude[index - 1];
        neighbor2 = magnitude[index + 1];
      } else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
        neighbor1 = magnitude[index - width + 1];
        neighbor2 = magnitude[index + width - 1];
      } else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
        neighbor1 = magnitude[index - width];
        neighbor2 = magnitude[index + width];
      } else {
        neighbor1 = magnitude[index - width - 1];
        neighbor2 = magnitude[index + width + 1];
      }

      // 최대값이면 유지, 아니면 제거
      if (mag >= neighbor1 && mag >= neighbor2) {
        result[index] = mag;
      } else {
        result[index] = 0;
      }
    }
  }

  return result;
}

function doubleThreshold(
  magnitude: Float32Array,
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number
): Uint8Array {
  const result = new Uint8Array(width * height);

  for (let i = 0; i < magnitude.length; i++) {
    const mag = magnitude[i];

    if (mag >= highThreshold) {
      result[i] = 2; // 강한 엣지
    } else if (mag >= lowThreshold) {
      result[i] = 1; // 약한 엣지
    } else {
      result[i] = 0; // 엣지 아님
    }
  }

  return result;
}

function edgeTrackingHysteresis(
  thresholded: Uint8Array,
  width: number,
  height: number
): ImageData {
  const result = new ImageData(width, height);
  const visited = new Uint8Array(width * height);

  // 강한 엣지부터 시작하여 연결된 약한 엣지 추적
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;

      if (thresholded[index] === 2 && visited[index] === 0) {
        // 강한 엣지부터 DFS로 연결된 약한 엣지 찾기
        traceEdge(thresholded, visited, result.data, x, y, width, height);
      }
    }
  }

  return result;
}

function traceEdge(
  thresholded: Uint8Array,
  visited: Uint8Array,
  output: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const stack: Array<{ x: number; y: number }> = [{ x, y }];

  while (stack.length > 0) {
    const { x: cx, y: cy } = stack.pop()!;
    const index = cy * width + cx;

    if (cx < 0 || cx >= width || cy < 0 || cy >= height ||
        visited[index] === 1 || thresholded[index] === 0) {
      continue;
    }

    visited[index] = 1;

    // 엣지로 표시
    const pixelIndex = index * 4;
    output[pixelIndex] = 255;
    output[pixelIndex + 1] = 255;
    output[pixelIndex + 2] = 255;
    output[pixelIndex + 3] = 255;

    // 8방향 이웃 탐색
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        stack.push({ x: cx + dx, y: cy + dy });
      }
    }
  }
}
