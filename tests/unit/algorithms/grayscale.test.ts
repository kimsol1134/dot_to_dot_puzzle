import { describe, it, expect } from 'vitest';
import { grayscaleConversion } from '@/lib/image-processing/grayscale';

describe('grayscaleConversion', () => {
  it('should convert a color pixel to grayscale using luminosity method', () => {
    // Create a simple 1x1 red pixel ImageData
    const imageData = new ImageData(1, 1);
    imageData.data[0] = 255; // R
    imageData.data[1] = 0;   // G
    imageData.data[2] = 0;   // B
    imageData.data[3] = 255; // A

    const result = grayscaleConversion(imageData);

    // Expected gray value: 0.299 * 255 + 0.587 * 0 + 0.114 * 0 = 76.245
    const expectedGray = Math.round(0.299 * 255);

    expect(result.data[0]).toBe(expectedGray); // R
    expect(result.data[1]).toBe(expectedGray); // G
    expect(result.data[2]).toBe(expectedGray); // B
    expect(result.data[3]).toBe(255); // Alpha should be 255
  });

  it('should convert a green pixel correctly', () => {
    const imageData = new ImageData(1, 1);
    imageData.data[0] = 0;   // R
    imageData.data[1] = 255; // G
    imageData.data[2] = 0;   // B
    imageData.data[3] = 255; // A

    const result = grayscaleConversion(imageData);

    // Expected: 0.299 * 0 + 0.587 * 255 + 0.114 * 0 = 149.685
    const expectedGray = Math.round(0.587 * 255);

    expect(result.data[0]).toBe(expectedGray);
    expect(result.data[1]).toBe(expectedGray);
    expect(result.data[2]).toBe(expectedGray);
    expect(result.data[3]).toBe(255);
  });

  it('should convert a blue pixel correctly', () => {
    const imageData = new ImageData(1, 1);
    imageData.data[0] = 0;   // R
    imageData.data[1] = 0;   // G
    imageData.data[2] = 255; // B
    imageData.data[3] = 255; // A

    const result = grayscaleConversion(imageData);

    // Expected: 0.299 * 0 + 0.587 * 0 + 0.114 * 255 = 29.07
    const expectedGray = Math.round(0.114 * 255);

    expect(result.data[0]).toBe(expectedGray);
    expect(result.data[1]).toBe(expectedGray);
    expect(result.data[2]).toBe(expectedGray);
    expect(result.data[3]).toBe(255);
  });

  it('should handle a 2x2 image', () => {
    const imageData = new ImageData(2, 2);

    // Pixel 1: Red (255, 0, 0)
    imageData.data[0] = 255;
    imageData.data[1] = 0;
    imageData.data[2] = 0;
    imageData.data[3] = 255;

    // Pixel 2: Green (0, 255, 0)
    imageData.data[4] = 0;
    imageData.data[5] = 255;
    imageData.data[6] = 0;
    imageData.data[7] = 255;

    // Pixel 3: Blue (0, 0, 255)
    imageData.data[8] = 0;
    imageData.data[9] = 0;
    imageData.data[10] = 255;
    imageData.data[11] = 255;

    // Pixel 4: White (255, 255, 255)
    imageData.data[12] = 255;
    imageData.data[13] = 255;
    imageData.data[14] = 255;
    imageData.data[15] = 255;

    const result = grayscaleConversion(imageData);

    expect(result.width).toBe(2);
    expect(result.height).toBe(2);

    // Verify each pixel was converted
    const gray1 = Math.round(0.299 * 255);
    const gray2 = Math.round(0.587 * 255);
    const gray3 = Math.round(0.114 * 255);
    const gray4 = Math.round(0.299 * 255 + 0.587 * 255 + 0.114 * 255);

    expect(result.data[0]).toBe(gray1);
    expect(result.data[4]).toBe(gray2);
    expect(result.data[8]).toBe(gray3);
    expect(result.data[12]).toBe(gray4);
  });

  it('should preserve image dimensions', () => {
    const width = 10;
    const height = 5;
    const imageData = new ImageData(width, height);

    const result = grayscaleConversion(imageData);

    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
    expect(result.data.length).toBe(width * height * 4);
  });

  it('should convert already grayscale image correctly', () => {
    const imageData = new ImageData(1, 1);
    imageData.data[0] = 128; // R
    imageData.data[1] = 128; // G
    imageData.data[2] = 128; // B
    imageData.data[3] = 255; // A

    const result = grayscaleConversion(imageData);

    // Expected: 0.299 * 128 + 0.587 * 128 + 0.114 * 128 = 128
    const expectedGray = Math.round(128);

    expect(result.data[0]).toBe(expectedGray);
    expect(result.data[1]).toBe(expectedGray);
    expect(result.data[2]).toBe(expectedGray);
  });
});
