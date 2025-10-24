import { describe, it, expect } from 'vitest';
import { cannyEdgeDetection } from '@/lib/image-processing/edge-detection';

describe('cannyEdgeDetection', () => {
  it('should detect edges in a simple vertical line', () => {
    // Create a 5x5 image with a vertical line in the middle
    const imageData = new ImageData(5, 5);

    // Fill with black background
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw a white vertical line in the middle (x=2)
    for (let y = 0; y < 5; y++) {
      const index = (y * 5 + 2) * 4;
      imageData.data[index] = 255;
      imageData.data[index + 1] = 255;
      imageData.data[index + 2] = 255;
      imageData.data[index + 3] = 255;
    }

    const result = cannyEdgeDetection(imageData);

    // Verify the result has the same dimensions
    expect(result.width).toBe(5);
    expect(result.height).toBe(5);

    // Verify that some edges were detected (at least one white pixel)
    let hasWhitePixel = false;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 255) {
        hasWhitePixel = true;
        break;
      }
    }
    expect(hasWhitePixel).toBe(true);
  });

  it('should detect edges in a simple horizontal line', () => {
    // Create a 5x5 image with a horizontal line in the middle
    const imageData = new ImageData(5, 5);

    // Fill with black background
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw a white horizontal line in the middle (y=2)
    for (let x = 0; x < 5; x++) {
      const index = (2 * 5 + x) * 4;
      imageData.data[index] = 255;
      imageData.data[index + 1] = 255;
      imageData.data[index + 2] = 255;
      imageData.data[index + 3] = 255;
    }

    const result = cannyEdgeDetection(imageData);

    expect(result.width).toBe(5);
    expect(result.height).toBe(5);

    // Verify that some edges were detected
    let hasWhitePixel = false;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 255) {
        hasWhitePixel = true;
        break;
      }
    }
    expect(hasWhitePixel).toBe(true);
  });

  it('should detect edges in a rectangle', () => {
    // Create a 10x10 image with a rectangle
    const imageData = new ImageData(10, 10);

    // Fill with black background
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw a white rectangle (2,2) to (7,7)
    for (let y = 2; y <= 7; y++) {
      for (let x = 2; x <= 7; x++) {
        const index = (y * 10 + x) * 4;
        imageData.data[index] = 255;
        imageData.data[index + 1] = 255;
        imageData.data[index + 2] = 255;
        imageData.data[index + 3] = 255;
      }
    }

    const result = cannyEdgeDetection(imageData);

    expect(result.width).toBe(10);
    expect(result.height).toBe(10);

    // Count white pixels (edges)
    let edgeCount = 0;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 255) {
        edgeCount++;
      }
    }

    // Should detect edges around the rectangle boundary
    expect(edgeCount).toBeGreaterThan(0);
  });

  it('should return an ImageData with correct dimensions', () => {
    const width = 20;
    const height = 15;
    const imageData = new ImageData(width, height);

    // Fill with some grayscale values
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 128;
      imageData.data[i + 1] = 128;
      imageData.data[i + 2] = 128;
      imageData.data[i + 3] = 255;
    }

    const result = cannyEdgeDetection(imageData);

    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
    expect(result.data.length).toBe(width * height * 4);
  });

  it('should handle uniform black image (no edges)', () => {
    const imageData = new ImageData(10, 10);

    // Fill with black
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    const result = cannyEdgeDetection(imageData);

    // Count white pixels
    let edgeCount = 0;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 255) {
        edgeCount++;
      }
    }

    // Uniform black image should have no edges
    expect(edgeCount).toBe(0);
  });

  it('should handle uniform white image (minimal edges)', () => {
    const imageData = new ImageData(10, 10);

    // Fill with white
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }

    const result = cannyEdgeDetection(imageData);

    // Count white pixels
    let edgeCount = 0;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 255) {
        edgeCount++;
      }
    }

    // Uniform image might have some edge artifacts at borders due to Gaussian blur boundaries
    // The important thing is that it's significantly less than an image with real edges
    expect(edgeCount).toBeLessThan(50); // Allow some border artifacts
  });

  it('should detect diagonal edges', () => {
    // Create a 10x10 image with a diagonal line
    const imageData = new ImageData(10, 10);

    // Fill with black background
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // Draw a white diagonal line
    for (let i = 0; i < 10; i++) {
      const index = (i * 10 + i) * 4;
      imageData.data[index] = 255;
      imageData.data[index + 1] = 255;
      imageData.data[index + 2] = 255;
      imageData.data[index + 3] = 255;
    }

    const result = cannyEdgeDetection(imageData);

    // Verify that edges were detected
    let hasWhitePixel = false;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 255) {
        hasWhitePixel = true;
        break;
      }
    }
    expect(hasWhitePixel).toBe(true);
  });
});
