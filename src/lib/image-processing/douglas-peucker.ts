/**
 * Douglas-Peucker Algorithm for Line Simplification
 *
 * Reduces the number of points in a polyline while preserving its shape.
 * This is crucial for creating age-appropriate dot-to-dot puzzles:
 * - Higher epsilon = fewer points = easier puzzle (for younger children)
 * - Lower epsilon = more points = harder puzzle (for older children)
 *
 * The algorithm works by recursively finding the point farthest from the line
 * connecting the first and last points, and splitting there if the distance
 * exceeds epsilon.
 */

export function douglasPeucker(
  points: Array<{ x: number; y: number }>,
  epsilon: number
): Array<{ x: number; y: number }> {
  if (points.length <= 2) {
    return points;
  }

  // Find the point with maximum distance from the line connecting first and last points
  let maxDistance = 0;
  let maxIndex = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end);

    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance > epsilon, recursively simplify
  if (maxDistance > epsilon) {
    const leftPoints = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const rightPoints = douglasPeucker(points.slice(maxIndex), epsilon);

    // Remove duplicate middle point
    return [...leftPoints.slice(0, -1), ...rightPoints];
  } else {
    // If max distance <= epsilon, keep only first and last points
    return [start, end];
  }
}

function perpendicularDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const { x: px, y: py } = point;
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // If line segment has zero length, return distance to point
  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  // Calculate perpendicular distance using cross product formula
  const numerator = Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dx ** 2 + dy ** 2);

  return numerator / denominator;
}
