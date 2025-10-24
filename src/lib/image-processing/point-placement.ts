/**
 * Point Placement Algorithm
 *
 * Converts contour points to puzzle dots based on difficulty level.
 * Uses Douglas-Peucker simplification with difficulty-adjusted epsilon,
 * then filters points to maintain minimum distance (prevents number overlap).
 *
 * Difficulty mapping:
 * - 0 (easy): epsilon=50 → fewer points
 * - 50 (medium): epsilon=27.5 → moderate points
 * - 100 (hard): epsilon=5 → many points
 */

import { douglasPeucker } from './douglas-peucker';
import type { Contour } from './contour-extraction';

export interface PlacedPoint {
  x: number;
  y: number;
  contourId: number;
}

export function placePoints(
  contours: Contour[],
  difficulty: number
): PlacedPoint[] {
  // Convert difficulty to epsilon
  // difficulty 0 (easy) → epsilon 50 (fewer points)
  // difficulty 100 (hard) → epsilon 5 (more points)
  const epsilon = 50 - (difficulty / 100) * 45;

  const allPoints: PlacedPoint[] = [];

  contours.forEach((contour, contourId) => {
    // Simplify using Douglas-Peucker algorithm
    const simplifiedPoints = douglasPeucker(contour.points, epsilon);

    // Convert to PlacedPoint format
    simplifiedPoints.forEach(point => {
      allPoints.push({
        x: point.x,
        y: point.y,
        contourId,
      });
    });
  });

  // Apply minimum distance constraint (prevent number overlap)
  const minDistance = 20; // pixels
  const filteredPoints = enforceMinDistance(allPoints, minDistance);

  return filteredPoints;
}

function enforceMinDistance(
  points: PlacedPoint[],
  minDistance: number
): PlacedPoint[] {
  if (points.length === 0) return points;

  const filtered: PlacedPoint[] = [points[0]];

  for (const point of points.slice(1)) {
    let isFarEnough = true;

    for (const existing of filtered) {
      const distance = Math.sqrt(
        (point.x - existing.x) ** 2 + (point.y - existing.y) ** 2
      );

      if (distance < minDistance) {
        isFarEnough = false;
        break;
      }
    }

    if (isFarEnough) {
      filtered.push(point);
    }
  }

  return filtered;
}
