/**
 * Converts a color image to grayscale using the luminosity method.
 * This method weights the RGB channels based on human perception:
 * - Red: 29.9%
 * - Green: 58.7% (humans are most sensitive to green)
 * - Blue: 11.4%
 *
 * @param imageData - The source ImageData to convert
 * @returns A new grayscale ImageData with the same dimensions
 */
export function grayscaleConversion(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const grayData = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Luminosity 방법 (인간 시각에 최적화)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    grayData.data[i] = gray;
    grayData.data[i + 1] = gray;
    grayData.data[i + 2] = gray;
    grayData.data[i + 3] = 255; // 알파 채널
  }

  return grayData;
}
