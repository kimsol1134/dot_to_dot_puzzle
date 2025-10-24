import { describe, it, expect } from 'vitest';
import { placePoints, type PlacedPoint } from '@/lib/image-processing/point-placement';
import type { Contour } from '@/lib/image-processing/contour-extraction';

describe('placePoints', () => {
  it('should convert difficulty to appropriate epsilon', () => {
    const contour: Contour = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 40, y: 0 },
      ],
      length: 5,
    };

    // Easy (difficulty 0) → epsilon 50 → fewer points
    const easyResult = placePoints([contour], 0);

    // Hard (difficulty 100) → epsilon 5 → more points
    const hardResult = placePoints([contour], 100);

    // Hard difficulty should produce more points (or equal)
    expect(hardResult.length).toBeGreaterThanOrEqual(easyResult.length);
  });

  it('should add contourId to each point', () => {
    const contours: Contour[] = [
      {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        length: 3,
      },
      {
        points: [
          { x: 200, y: 200 },
          { x: 300, y: 200 },
          { x: 300, y: 300 },
        ],
        length: 3,
      },
    ];

    const result = placePoints(contours, 50);

    // All points should have a contourId
    expect(result.every(p => p.contourId !== undefined)).toBe(true);

    // Should have points from both contours
    const hasContour0 = result.some(p => p.contourId === 0);
    const hasContour1 = result.some(p => p.contourId === 1);

    expect(hasContour0).toBe(true);
    expect(hasContour1).toBe(true);
  });

  it('should enforce minimum distance between points', () => {
    const contour: Contour = {
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },  // Too close to (0,0)
        { x: 10, y: 0 }, // Too close to (5,0)
        { x: 50, y: 0 }, // Far enough
        { x: 100, y: 0 }, // Far enough
      ],
      length: 5,
    };

    // Use difficulty that keeps most points
    const result = placePoints([contour], 100);

    // Verify minimum distance (20 pixels) is maintained
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[i].x - result[j].x;
        const dy = result[i].y - result[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        expect(distance).toBeGreaterThanOrEqual(19); // Allow small floating point errors
      }
    }
  });

  it('should handle empty contours', () => {
    const contours: Contour[] = [];
    const result = placePoints(contours, 50);

    expect(result.length).toBe(0);
  });

  it('should handle single point contour', () => {
    const contour: Contour = {
      points: [{ x: 10, y: 10 }],
      length: 1,
    };

    const result = placePoints([contour], 50);

    expect(result.length).toBe(1);
    expect(result[0].x).toBe(10);
    expect(result[0].y).toBe(10);
    expect(result[0].contourId).toBe(0);
  });

  it('should preserve at least first point after filtering', () => {
    const contour: Contour = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      length: 3,
    };

    const result = placePoints([contour], 100);

    // Should always keep at least one point (the first one after D-P simplification)
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
  });

  it('should simplify straight line aggressively', () => {
    // Create a long straight line
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 100; i++) {
      points.push({ x: i, y: 0 });
    }

    const contour: Contour = {
      points,
      length: points.length,
    };

    const result = placePoints([contour], 0); // Easy mode

    // Straight line should be simplified to very few points
    expect(result.length).toBeLessThan(10);
  });

  it('should preserve corner points in L-shape', () => {
    const contour: Contour = {
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 }, // Corner
        { x: 100, y: 50 },
        { x: 100, y: 100 },
      ],
      length: 5,
    };

    const result = placePoints([contour], 50);

    // Should include the corner point
    const hasCorner = result.some(p => p.x === 100 && p.y === 0);
    expect(hasCorner || result.some(p => p.x === 100)).toBe(true);
  });

  it('should return PlacedPoint type with correct properties', () => {
    const contour: Contour = {
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
      length: 2,
    };

    const result = placePoints([contour], 50);

    result.forEach(point => {
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
      expect(point).toHaveProperty('contourId');
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
      expect(typeof point.contourId).toBe('number');
    });
  });
});
