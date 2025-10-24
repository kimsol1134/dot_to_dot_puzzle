/**
 * Point Numbering Algorithm
 *
 * IMPORTANT: This does NOT re-sort points using Nearest Neighbor!
 * Douglas-Peucker preserves the original contour order.
 * We only rotate the array to start from the desired position.
 *
 * This ensures the dot-to-dot path follows the natural outline
 * of the character, not a potentially tangled nearest-neighbor path.
 */

import type { PlacedPoint } from './point-placement';

export interface NumberedPoint {
  x: number;
  y: number;
  number: number;
}

export function assignNumbers(
  points: PlacedPoint[],
  startPosition: 'top-left' | 'top-right' | 'center'
): NumberedPoint[] {
  if (points.length === 0) return [];

  // 1. Find the starting point index
  const startIndex = findStartPointIndex(points, startPosition);

  // 2. Rotate array to start from the chosen point
  // Example: [A, B, C, D, E] with start at C (index 2)
  // Result: [C, D, E, A, B]
  const reordered = [
    ...points.slice(startIndex),
    ...points.slice(0, startIndex),
  ];

  // 3. Assign sequential numbers starting from 1
  return reordered.map((point, index) => ({
    x: point.x,
    y: point.y,
    number: index + 1,
  }));
}

function findStartPointIndex(
  points: PlacedPoint[],
  startPosition: 'top-left' | 'top-right' | 'center'
): number {
  if (startPosition === 'top-left') {
    // Find point closest to top-left corner (smallest x+y)
    return points.reduce(
      (minIdx, point, idx) =>
        point.x + point.y < points[minIdx].x + points[minIdx].y ? idx : minIdx,
      0
    );
  } else if (startPosition === 'top-right') {
    // Find point closest to top-right corner (largest x, smallest y)
    const maxX = Math.max(...points.map(p => p.x));
    return points.reduce(
      (minIdx, point, idx) =>
        (maxX - point.x) + point.y < (maxX - points[minIdx].x) + points[minIdx].y
          ? idx
          : minIdx,
      0
    );
  } else {
    // Find point closest to center
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    return points.reduce((minIdx, point, idx) => {
      const distPoint = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;
      const distMin =
        (points[minIdx].x - centerX) ** 2 + (points[minIdx].y - centerY) ** 2;
      return distPoint < distMin ? idx : minIdx;
    }, 0);
  }
}
