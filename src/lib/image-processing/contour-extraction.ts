/**
 * Contour Extraction using Moore-Neighborhood Tracing
 *
 * IMPORTANT: This extracts only the LONGEST contour (not all contours).
 * This is the main character outline. Multiple contours would include
 * internal details (eyes, nose, mouth) making the puzzle too complex for children.
 */

export interface Contour {
  points: Array<{ x: number; y: number }>;
  length: number; // Total number of points in the contour
}

export function extractContours(edgeData: ImageData): Contour[] {
  const { data, width, height } = edgeData;

  // 1. Convert to binary (Canny result is already binary-like)
  const binaryData = new Uint8Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    binaryData[i / 4] = data[i] > 128 ? 1 : 0;
  }

  // 2. Find connected components
  const visited = new Uint8Array(width * height);
  const contours: Contour[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;

      if (binaryData[index] === 1 && visited[index] === 0) {
        const contour = traceContour(binaryData, visited, width, height, x, y);

        // Filter out small noise (< 50 points)
        if (contour.points.length > 50) {
          contours.push(contour);
        }
      }
    }
  }

  // 3. Sort by length (longest first)
  contours.sort((a, b) => b.length - a.length);

  // ⭐ KEY: Return only the longest contour (main character outline)
  return contours.length > 0 ? [contours[0]] : [];
}

function traceContour(
  binaryData: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): Contour {
  const points: Array<{ x: number; y: number }> = [];

  // Trace contour clockwise (preserves order)
  let x = startX;
  let y = startY;
  let direction = 0; // Start direction (east)

  // 8 directions (Moore neighborhood)
  const directions = [
    { dx: 1, dy: 0 },   // East
    { dx: 1, dy: 1 },   // Southeast
    { dx: 0, dy: 1 },   // South
    { dx: -1, dy: 1 },  // Southwest
    { dx: -1, dy: 0 },  // West
    { dx: -1, dy: -1 }, // Northwest
    { dx: 0, dy: -1 },  // North
    { dx: 1, dy: -1 },  // Northeast
  ];

  const maxIterations = width * height; // Prevent infinite loop
  let iterations = 0;

  do {
    const index = y * width + x;
    visited[index] = 1;
    points.push({ x, y });

    // Find next boundary point (clockwise search)
    let found = false;

    for (let i = 0; i < 8; i++) {
      const checkDir = (direction + 7 + i) % 8; // Start counterclockwise
      const { dx, dy } = directions[checkDir];
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;

        if (binaryData[nIndex] === 1) {
          x = nx;
          y = ny;
          direction = checkDir;
          found = true;
          break;
        }
      }
    }

    if (!found) break;

    iterations++;
    if (iterations > maxIterations) break;

    // Stop when we return to start point
    if (points.length > 1 && x === startX && y === startY) {
      break;
    }
  } while (true);

  return { points, length: points.length };
}
