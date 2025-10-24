import { describe, it, expect } from 'vitest';
import { assignNumbers, type NumberedPoint } from '@/lib/image-processing/numbering';
import type { PlacedPoint } from '@/lib/image-processing/point-placement';

describe('assignNumbers', () => {
  it('should return empty array for empty input', () => {
    const points: PlacedPoint[] = [];
    const result = assignNumbers(points, 'top-left');

    expect(result.length).toBe(0);
  });

  it('should assign sequential numbers starting from 1', () => {
    const points: PlacedPoint[] = [
      { x: 10, y: 10, contourId: 0 },
      { x: 20, y: 20, contourId: 0 },
      { x: 30, y: 30, contourId: 0 },
    ];

    const result = assignNumbers(points, 'top-left');

    expect(result.length).toBe(3);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
    expect(result[2].number).toBe(3);
  });

  it('should start from top-left point', () => {
    const points: PlacedPoint[] = [
      { x: 50, y: 50, contourId: 0 }, // Middle
      { x: 10, y: 10, contourId: 0 }, // Top-left (smallest x+y)
      { x: 90, y: 90, contourId: 0 }, // Bottom-right
    ];

    const result = assignNumbers(points, 'top-left');

    // Point at (10,10) should be numbered 1
    const firstPoint = result.find(p => p.number === 1);
    expect(firstPoint?.x).toBe(10);
    expect(firstPoint?.y).toBe(10);
  });

  it('should start from top-right point', () => {
    const points: PlacedPoint[] = [
      { x: 10, y: 10, contourId: 0 }, // Top-left
      { x: 90, y: 10, contourId: 0 }, // Top-right (large x, small y)
      { x: 50, y: 50, contourId: 0 }, // Middle
    ];

    const result = assignNumbers(points, 'top-right');

    // Point at (90,10) should be numbered 1
    const firstPoint = result.find(p => p.number === 1);
    expect(firstPoint?.x).toBe(90);
    expect(firstPoint?.y).toBe(10);
  });

  it('should start from center point', () => {
    const points: PlacedPoint[] = [
      { x: 0, y: 0, contourId: 0 },   // Top-left
      { x: 100, y: 0, contourId: 0 }, // Top-right
      { x: 50, y: 50, contourId: 0 }, // Center
      { x: 0, y: 100, contourId: 0 }, // Bottom-left
      { x: 100, y: 100, contourId: 0 }, // Bottom-right
    ];

    const result = assignNumbers(points, 'center');

    // Point at (50,50) should be numbered 1 (closest to center)
    const firstPoint = result.find(p => p.number === 1);
    expect(firstPoint?.x).toBe(50);
    expect(firstPoint?.y).toBe(50);
  });

  it('should preserve original point order (rotate, not resort)', () => {
    const points: PlacedPoint[] = [
      { x: 20, y: 20, contourId: 0 }, // Index 0
      { x: 30, y: 30, contourId: 0 }, // Index 1
      { x: 10, y: 10, contourId: 0 }, // Index 2 - top-left
      { x: 40, y: 40, contourId: 0 }, // Index 3
    ];

    const result = assignNumbers(points, 'top-left');

    // Starting from (10,10) at index 2, the order should be:
    // (10,10) [was index 2] → number 1
    // (40,40) [was index 3] → number 2
    // (20,20) [was index 0] → number 3
    // (30,30) [was index 1] → number 4

    expect(result[0]).toEqual({ x: 10, y: 10, number: 1 });
    expect(result[1]).toEqual({ x: 40, y: 40, number: 2 });
    expect(result[2]).toEqual({ x: 20, y: 20, number: 3 });
    expect(result[3]).toEqual({ x: 30, y: 30, number: 4 });
  });

  it('should handle single point', () => {
    const points: PlacedPoint[] = [
      { x: 50, y: 50, contourId: 0 },
    ];

    const result = assignNumbers(points, 'center');

    expect(result.length).toBe(1);
    expect(result[0].number).toBe(1);
    expect(result[0].x).toBe(50);
    expect(result[0].y).toBe(50);
  });

  it('should remove contourId property from result', () => {
    const points: PlacedPoint[] = [
      { x: 10, y: 10, contourId: 5 },
      { x: 20, y: 20, contourId: 5 },
    ];

    const result = assignNumbers(points, 'top-left');

    result.forEach(point => {
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
      expect(point).toHaveProperty('number');
      expect(point).not.toHaveProperty('contourId');
    });
  });

  it('should handle points in a square pattern', () => {
    // Square: TL, TR, BR, BL (clockwise)
    const points: PlacedPoint[] = [
      { x: 0, y: 0, contourId: 0 },   // Top-left
      { x: 100, y: 0, contourId: 0 }, // Top-right
      { x: 100, y: 100, contourId: 0 }, // Bottom-right
      { x: 0, y: 100, contourId: 0 }, // Bottom-left
    ];

    const result = assignNumbers(points, 'top-left');

    // Should start from top-left corner
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[0].number).toBe(1);

    // Order should be preserved (rotated, not sorted)
    expect(result[1].number).toBe(2);
    expect(result[2].number).toBe(3);
    expect(result[3].number).toBe(4);
  });

  it('should calculate center correctly for asymmetric shapes', () => {
    const points: PlacedPoint[] = [
      { x: 0, y: 0, contourId: 0 },
      { x: 100, y: 0, contourId: 0 },
      { x: 50, y: 25, contourId: 0 }, // Closest to center (50, 12.5)
    ];

    const result = assignNumbers(points, 'center');

    // Point at (50, 25) should be closest to center and numbered 1
    const firstPoint = result.find(p => p.number === 1);
    expect(firstPoint?.x).toBe(50);
    expect(firstPoint?.y).toBe(25);
  });
});
