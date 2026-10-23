import { MogResult } from '../types/analysis';

/**
 * Procedurally draws a high-resolution exportable Result Card onto an off-screen HTML5 canvas
 * and returns data URL / blob.
 */
export async function renderResultCardCanvas(
  result: MogResult,
  includePhoto: boolean = false
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1350; // 4:5 Instagram/TikTok/Twitter friendly aspect ratio

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Dark futuristic background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#07090D');
  bgGrad.addColorStop(0.5, '#0B0F17');
  bgGrad.addColorStop(1, '#05070A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle tech grid
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 45;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Cybernetic framing borders and corner brackets
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Corner HUD accents
  const cornerLen = 30;
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 4;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(40, 40 + cornerLen);
  ctx.lineTo(40, 40);
  ctx.lineTo(40 + cornerLen, 40);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 40 - cornerLen, 40);
  ctx.lineTo(width - 40, 40);
  ctx.lineTo(width - 40, 40 + cornerLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(40, height - 40 - cornerLen);
  ctx.lineTo(40, height - 40);
  ctx.lineTo(40 + cornerLen, height - 40);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 40 - cornerLen, height - 40);
  ctx.lineTo(width - 40, height - 40);
  ctx.lineTo(width - 40, height - 40 - cornerLen);
  ctx.stroke();

  // 4. Header & Branding
  ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('IWILLMOGYOU', 90, 115);

  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText('FACIAL TELEMETRY ARCHIVE // VERIFIED', 90, 145);

  ctx.textAlign = 'right';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#98A2B3';
  ctx.fillText(result.shareCode || 'CODE: MOG-PRO', width - 90, 115);

  // 5. Optional Face Snapshot or Cyber Wireframe Avatar
  const avatarY = 190;
  const avatarSize = 360;
  const avatarX = (width - avatarSize) / 2;

  // Background frame
  ctx.save();
  ctx.fillStyle = '#10141C';
  ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);

  if (includePhoto && result.capturedImageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = result.capturedImageUrl!;
      });
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
    } catch {
      // Fallback if image load fails
      drawCyberAvatar(ctx, avatarX, avatarY, avatarSize);
    }
  } else {
    drawCyberAvatar(ctx, avatarX, avatarY, avatarSize);
  }
  ctx.restore();

  // 6. Giant Mog Score Display
  const scoreY = 630;
  ctx.textAlign = 'center';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#98A2B3';
  ctx.fillText('OFFICIAL MOG SCORE', width / 2, scoreY);

  // Glow on score number
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 20;
  ctx.font = '900 110px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(String(result.mogScore), width / 2, scoreY + 95);
  ctx.shadowBlur = 0;

  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText('/ 100', width / 2 + 130, scoreY + 45);

  // 7. Aura Rank Badge
  const rankY = scoreY + 160;
  const rankBadgeWidth = 560;
  const rankBadgeHeight = 64;
  const rankBadgeX = (width - rankBadgeWidth) / 2;

  ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rankBadgeX, rankY, rankBadgeWidth, rankBadgeHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText(result.rankTier, width / 2, rankY + 43);

  // Aura points subtitle
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFC857';
  ctx.fillText(`+${result.auraPoints.toLocaleString()} AURA POINTS EARNED`, width / 2, rankY + 105);

  // 8. Verdict box
  const verdictY = rankY + 140;
  ctx.font = 'italic 500 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#F5F7FA';
  // Wrap text
  wrapText(ctx, `"${result.verdict}"`, width / 2, verdictY, 820, 32);

  // 9. Key Metrics Row
  const metricsY = verdictY + 95;
  const m1X = width / 2 - 280;
  const m2X = width / 2;
  const m3X = width / 2 + 280;

  drawMetricBadge(ctx, m1X, metricsY, 'SYMMETRY', `${result.measurements.symmetryEstimate}%`);
  drawMetricBadge(ctx, m2X, metricsY, 'CANTHAL TILT', `${result.measurements.canthalTilt.angleDeg > 0 ? '+' : ''}${result.measurements.canthalTilt.angleDeg}°`);
  drawMetricBadge(ctx, m3X, metricsY, 'JAW RATIO', `${result.measurements.jawToCheekRatio}`);

  // 10. Footer CTA & Link
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(90, height - 120);
  ctx.lineTo(width - 90, height - 120);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('DO YOU HAVE WHAT IT TAKES TO MOG ME?', 90, height - 70);

  ctx.textAlign = 'right';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText('SCAN AT IWILLMOGYOU.COM', width - 90, height - 70);

  return canvas;
}

function drawCyberAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // Decorative cyber face wireframe
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 1.5;

  // Face oval
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 0.28, size * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Eye line & midline
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.28, cy - size * 0.05);
  ctx.lineTo(cx + size * 0.28, cy - size * 0.05);
  ctx.moveTo(cx, cy - size * 0.38);
  ctx.lineTo(cx, cy + size * 0.38);
  ctx.stroke();

  // Target crosshairs
  ctx.fillStyle = '#00E5FF';
  [
    [cx - 45, cy - 15],
    [cx + 45, cy - 15],
    [cx, cy + 20],
    [cx, cy + 70],
  ].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawMetricBadge(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string) {
  ctx.textAlign = 'center';
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#98A2B3';
  ctx.fillText(label, x, y);

  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText(value, x, y + 32);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

/**
 * Downloads the rendered result card as a PNG file
 */
export async function downloadResultCard(result: MogResult, includePhoto: boolean = false): Promise<void> {
  const canvas = await renderResultCardCanvas(result, includePhoto);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `IWillMogYou-${result.rankTier.replace(/\s+/g, '_')}-${result.mogScore}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
