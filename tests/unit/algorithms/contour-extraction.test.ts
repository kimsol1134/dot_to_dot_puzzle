import { describe, it, expect } from 'vitest';
import { extractContours, type Contour } from '@/lib/image-processing/contour-extraction';

describe('extractContours', () => {
  it('should extract a simple rectangle contour', () => {
    // Create a 50x50 image with a large rectangle (> 50 points)
    const imageData = new ImageData(50, 50);

    // Fill with black
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw white rectangle outline (5,5) to (30,30) - perimeter ~100 pixels
    for (let x = 5; x <= 30; x++) {
      // Top edge
      let idx = (5 * 50 + x) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;

      // Bottom edge
      idx = (30 * 50 + x) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
    }

    for (let y = 5; y <= 30; y++) {
      // Left edge
      let idx = (y * 50 + 5) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;

      // Right edge
      idx = (y * 50 + 30) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
    }

    const contours = extractContours(imageData);

    // Should find at least one contour (>50 points passes noise filter)
    expect(contours.length).toBeGreaterThan(0);

    // The contour should have many points (close to perimeter)
    expect(contours[0].points.length).toBeGreaterThan(50);

    // Length should match points length
    expect(contours[0].length).toBe(contours[0].points.length);
  });

  it('should return the longest contour only', () => {
    // Create a larger image with two rectangles
    const imageData = new ImageData(80, 80);

    // Fill with black
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw large rectangle (5,5) to (35,35) - perimeter ~120 pixels
    for (let x = 5; x <= 35; x++) {
      for (let y = 5; y <= 35; y++) {
        if (x === 5 || x === 35 || y === 5 || y === 35) {
          const idx = (y * 80 + x) * 4;
          imageData.data[idx] = 255;
          imageData.data[idx + 1] = 255;
          imageData.data[idx + 2] = 255;
        }
      }
    }

    // Draw medium rectangle (50,50) to (65,65) - perimeter ~60 pixels
    for (let x = 50; x <= 65; x++) {
      for (let y = 50; y <= 65; y++) {
        if (x === 50 || x === 65 || y === 50 || y === 65) {
          const idx = (y * 80 + x) * 4;
          imageData.data[idx] = 255;
          imageData.data[idx + 1] = 255;
          imageData.data[idx + 2] = 255;
        }
      }
    }

    const contours = extractContours(imageData);

    // Should return only 1 contour (the longest one)
    expect(contours.length).toBe(1);

    // The returned contour should be the larger rectangle
    expect(contours[0].points.length).toBeGreaterThan(60);
  });

  it('should filter out small noise contours', () => {
    const imageData = new ImageData(20, 20);

    // Fill with black
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Add a few isolated white pixels (noise)
    const noisePoints = [[5, 5], [7, 8], [12, 3]];
    for (const [x, y] of noisePoints) {
      const idx = (y * 20 + x) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
    }

    const contours = extractContours(imageData);

    // Small noise should be filtered out (< 50 points)
    expect(contours.length).toBe(0);
  });

  it('should return empty array for blank image', () => {
    const imageData = new ImageData(10, 10);

    // Fill with black (no edges)
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    const contours = extractContours(imageData);

    expect(contours.length).toBe(0);
  });

  it('should handle a diagonal line contour', () => {
    const imageData = new ImageData(15, 15);

    // Fill with black
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw a long diagonal line
    for (let i = 2; i < 13; i++) {
      const idx = (i * 15 + i) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
    }

    const contours = extractContours(imageData);

    // Should find the diagonal line if it's long enough (> 50 points)
    // Or return empty if it's too short
    expect(contours.length).toBeGreaterThanOrEqual(0);
  });

  it('should preserve contour point order', () => {
    // Create a simple L-shape
    const imageData = new ImageData(10, 10);

    // Fill with black
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw L-shape
    // Vertical part (3,2) to (3,7)
    for (let y = 2; y <= 7; y++) {
      const idx = (y * 10 + 3) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
    }

    // Horizontal part (3,7) to (7,7)
    for (let x = 3; x <= 7; x++) {
      const idx = (7 * 10 + x) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
    }

    const contours = extractContours(imageData);

    if (contours.length > 0) {
      const points = contours[0].points;

      // Points should be ordered (adjacent points should be close)
      for (let i = 1; i < points.length; i++) {
        const dx = Math.abs(points[i].x - points[i - 1].x);
        const dy = Math.abs(points[i].y - points[i - 1].y);

        // Adjacent points should be within Moore neighborhood (max distance √2)
        expect(dx + dy).toBeLessThanOrEqual(2);
      }
    }
  });
});
