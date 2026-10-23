import { NormalizedLandmark } from '../types/analysis';

// Canonical Face Mesh contour connections
export const MESH_CONTOURS = {
  // Face perimeter / jawline
  jawline: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400,
    377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
  ],
  // Left eye contour
  leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
  // Right eye contour
  rightEye: [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263],
  // Left eyebrow
  leftEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  // Right eyebrow
  rightEyebrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
  // Lips outer
  lipsOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61],
  // Nose bridge & midline
  noseBridge: [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 2, 164, 0, 17, 18, 200, 199, 175, 152],
};

// Selected key landmark points for prominent dots
export const PROMINENT_POINTS = [
  10, 152, 168, 1, 2, 33, 133, 263, 362, 234, 454, 172, 397, 61, 291, 70, 300,
];

/**
 * Draws the futuristic cybernetic face mesh overlay on an HTMLCanvasElement
 */
export function drawFaceMeshOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  options: {
    color?: string;
    showMeshLines?: boolean;
    showContours?: boolean;
    showPoints?: boolean;
    showMidline?: boolean;
    pulseGlow?: number; // 0 to 1
  } = {}
) {
  const {
    color = '#00E5FF',
    showMeshLines = true,
    showContours = true,
    showPoints = true,
    showMidline = true,
    pulseGlow = 0.8,
  } = options;

  if (!landmarks || landmarks.length === 0) return;

  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // 1. Draw Mesh Contours
  if (showContours) {
    const drawContour = (indices: number[]) => {
      ctx.beginPath();
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        const pt = landmarks[idx];
        if (!pt) continue;
        const x = pt.x * width;
        const y = pt.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    ctx.globalAlpha = 0.5 * pulseGlow;
    drawContour(MESH_CONTOURS.jawline);
    drawContour(MESH_CONTOURS.leftEye);
    drawContour(MESH_CONTOURS.rightEye);
    drawContour(MESH_CONTOURS.leftEyebrow);
    drawContour(MESH_CONTOURS.rightEyebrow);
    drawContour(MESH_CONTOURS.lipsOuter);
  }

  // 2. Draw Subtle Triangulation Mesh Lines
  if (showMeshLines) {
    ctx.globalAlpha = 0.18 * pulseGlow;
    ctx.beginPath();
    // Interconnect key regions
    const triPairs: [number, number][] = [
      [10, 234], [10, 454], [10, 168],
      [168, 33], [168, 263], [168, 133], [168, 362],
      [1, 234], [1, 454], [1, 61], [1, 291],
      [152, 172], [152, 397], [152, 61], [152, 291],
      [234, 172], [454, 397],
      [33, 172], [263, 397],
      [133, 362],
    ];

    for (const [a, b] of triPairs) {
      const ptA = landmarks[a];
      const ptB = landmarks[b];
      if (ptA && ptB) {
        ctx.moveTo(ptA.x * width, ptA.y * height);
        ctx.lineTo(ptB.x * width, ptB.y * height);
      }
    }
    ctx.stroke();
  }

  // 3. Draw Vertical Midline
  if (showMidline) {
    const top = landmarks[10];
    const bottom = landmarks[152];
    if (top && bottom) {
      ctx.globalAlpha = 0.35 * pulseGlow;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(top.x * width, top.y * height);
      ctx.lineTo(bottom.x * width, bottom.y * height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 4. Prominent Tracking Landmark Dots & Glow
  if (showPoints) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.9;

    for (const idx of PROMINENT_POINTS) {
      const pt = landmarks[idx];
      if (!pt) continue;
      const x = pt.x * width;
      const y = pt.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Special reticle at nose tip
    const nose = landmarks[1];
    if (nose) {
      const nx = nose.x * width;
      const ny = nose.y * height;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}
