import { describe, it, expect } from 'vitest';
import { douglasPeucker } from '@/lib/image-processing/douglas-peucker';

describe('douglasPeucker', () => {
  it('should return original points when length <= 2', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
    const result = douglasPeucker(points, 1.0);

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[1]).toEqual({ x: 10, y: 10 });
  });

  it('should simplify a straight line to two points', () => {
    // Points along a straight line
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ];

    // With epsilon=0.5, all intermediate points should be removed
    const result = douglasPeucker(points, 0.5);

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[1]).toEqual({ x: 4, y: 4 });
  });

  it('should preserve significant corner points', () => {
    // L-shaped path with a corner
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ];

    // With epsilon=0.5, the corner should be preserved
    const result = douglasPeucker(points, 0.5);

    expect(result.length).toBeGreaterThan(2);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[result.length - 1]).toEqual({ x: 2, y: 2 });

    // Corner point should be included
    const hasCorner = result.some(p => p.x === 2 && p.y === 0);
    expect(hasCorner).toBe(true);
  });

  it('should be more aggressive with higher epsilon', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1.5 },
      { x: 3, y: 1 },
      { x: 4, y: 0 },
    ];

    // Low epsilon - keeps more points
    const resultLowEpsilon = douglasPeucker(points, 0.1);

    // High epsilon - removes more points
    const resultHighEpsilon = douglasPeucker(points, 2.0);

    expect(resultHighEpsilon.length).toBeLessThanOrEqual(resultLowEpsilon.length);
  });

  it('should preserve first and last points', () => {
    const points = [
      { x: 5, y: 10 },
      { x: 6, y: 11 },
      { x: 7, y: 12 },
      { x: 8, y: 13 },
    ];

    const result = douglasPeucker(points, 1.0);

    // First and last points must always be preserved
    expect(result[0]).toEqual(points[0]);
    expect(result[result.length - 1]).toEqual(points[points.length - 1]);
  });

  it('should handle zig-zag pattern', () => {
    // Zig-zag pattern
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 },
      { x: 4, y: 0 },
    ];

    // With small epsilon, keep sharp turns
    const result = douglasPeucker(points, 0.3);

    // Should keep peaks/valleys in zig-zag
    expect(result.length).toBeGreaterThan(2);
  });

  it('should handle single point', () => {
    const points = [{ x: 5, y: 5 }];
    const result = douglasPeucker(points, 1.0);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ x: 5, y: 5 });
  });

  it('should handle empty array', () => {
    const points: Array<{ x: number; y: number }> = [];
    const result = douglasPeucker(points, 1.0);

    expect(result.length).toBe(0);
  });

  it('should reduce complex curve to simplified version', () => {
    // Create a curve with many points
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 100; i++) {
      const x = i;
      const y = Math.sin(i / 10) * 10;
      points.push({ x, y });
    }

    // Simplify with moderate epsilon
    const result = douglasPeucker(points, 2.0);

    // Should significantly reduce number of points
    expect(result.length).toBeLessThan(points.length / 2);

    // First and last points preserved
    expect(result[0].x).toBe(0);
    expect(result[result.length - 1].x).toBe(100);
  });

  it('should handle rectangle shape', () => {
    // Rectangle: (0,0) -> (10,0) -> (10,5) -> (0,5) -> (0,0)
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 2.5 },
      { x: 10, y: 5 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 2.5 },
      { x: 0, y: 0 },
    ];

    const result = douglasPeucker(points, 0.5);

    // Should keep the 4 corners (or close to it)
    expect(result.length).toBeGreaterThanOrEqual(4);

    // Should preserve corners
    expect(result).toContainEqual({ x: 0, y: 0 });
    expect(result).toContainEqual({ x: 10, y: 0 });
    expect(result).toContainEqual({ x: 10, y: 5 });
    expect(result).toContainEqual({ x: 0, y: 5 });
  });
});
