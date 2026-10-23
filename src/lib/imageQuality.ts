import { ImageQualityMetrics } from '../types/analysis';

/**
 * Evaluates brightness, contrast, and sharpness from an HTMLCanvasElement
 */
export function evaluateImageQuality(canvas: HTMLCanvasElement): ImageQualityMetrics {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      brightness: 128,
      contrast: 40,
      sharpnessScore: 65,
      isGoodQuality: true,
      lightingLabel: 'Balanced Lighting',
    };
  }

  // Downsample for performance (e.g. 160x120 is plenty for lighting and sharpness)
  const sampleWidth = Math.min(160, canvas.width);
  const sampleHeight = Math.min(120, canvas.height);
  
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleCtx = sampleCanvas.getContext('2d');
  if (!sampleCtx) {
    return {
      brightness: 128,
      contrast: 40,
      sharpnessScore: 65,
      isGoodQuality: true,
      lightingLabel: 'Balanced Lighting',
    };
  }

  sampleCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);
  const imgData = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imgData.data;

  let totalLuma = 0;
  const lumaArray = new Float32Array(sampleWidth * sampleHeight);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Rec. 601 luma formula
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    lumaArray[i / 4] = luma;
    totalLuma += luma;
  }

  const pixelCount = sampleWidth * sampleHeight;
  const avgBrightness = totalLuma / pixelCount;

  // Contrast: standard deviation of luminance
  let varianceSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    const diff = lumaArray[i] - avgBrightness;
    varianceSum += diff * diff;
  }
  const contrast = Math.sqrt(varianceSum / pixelCount);

  // Sharpness approximation using horizontal gradient variance
  let gradSum = 0;
  for (let y = 1; y < sampleHeight - 1; y++) {
    for (let x = 1; x < sampleWidth - 1; x++) {
      const idx = y * sampleWidth + x;
      const gx = lumaArray[idx + 1] - lumaArray[idx - 1];
      const gy = lumaArray[idx + sampleWidth] - lumaArray[idx - sampleWidth];
      gradSum += Math.abs(gx) + Math.abs(gy);
    }
  }
  const avgGrad = gradSum / (pixelCount * 2);
  const sharpnessScore = Math.min(100, Math.max(10, Math.round(avgGrad * 4)));

  let lightingLabel: ImageQualityMetrics['lightingLabel'] = 'Balanced Lighting';
  if (avgBrightness < 65) {
    lightingLabel = 'Underexposed';
  } else if (avgBrightness > 195) {
    lightingLabel = 'Overexposed';
  } else if (contrast > 68) {
    lightingLabel = 'Harsh Shadows';
  }

  const isGoodQuality = avgBrightness >= 60 && avgBrightness <= 200 && contrast >= 20 && sharpnessScore >= 30;

  return {
    brightness: Math.round(avgBrightness),
    contrast: Math.round(contrast),
    sharpnessScore,
    isGoodQuality,
    lightingLabel,
  };
}
