import {
  NormalizedLandmark,
  FacialMeasurements,
  CanthalTilt,
  HeadPose,
  FramingQuality,
  ImageQualityMetrics,
} from '../types/analysis';

// Key MediaPipe 468/478 Face Mesh landmark indices
export const LANDMARK_INDEX = {
  // Center midline
  FOREHEAD_TOP: 10,
  NOSE_BRIDGE: 168,
  NOSE_TIP: 1,
  SUB_NASALE: 2,
  CHIN: 152,

  // Cheeks / Zygomas
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,

  // Jaw corners / Gonions
  LEFT_JAW_ANGLE: 172,
  RIGHT_JAW_ANGLE: 397,
  CHIN_BOTTOM: 152,

  // Left eye
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,

  // Right eye
  RIGHT_EYE_OUTER: 263,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,

  // Eyebrows
  LEFT_EYEBROW_ARCH: 70,
  RIGHT_EYEBROW_ARCH: 300,

  // Mouth
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  MOUTH_TOP: 0,
  MOUTH_BOTTOM: 17,
};

function euclideanDist(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Distance from point to line passing through l1 and l2
function distToLine(p: NormalizedLandmark, l1: NormalizedLandmark, l2: NormalizedLandmark): number {
  const numerator = Math.abs((l2.y - l1.y) * p.x - (l2.x - l1.x) * p.y + l2.x * l1.y - l2.y * l1.x);
  const denominator = Math.sqrt((l2.y - l1.y) ** 2 + (l2.x - l1.x) ** 2);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculates real facial measurements and geometric indicators from MediaPipe landmarks
 */
export function calculateFacialMeasurements(
  landmarks: NormalizedLandmark[],
  imageQuality: ImageQualityMetrics,
  facesCount: number = 1
): FacialMeasurements {
  const availableMeasurements: string[] = [];
  const limitations: string[] = [
    '2D image measurements are planar approximations and do not represent true 3D craniofacial anatomy.',
    'Perspective distortion and camera focal length alter apparent facial width and symmetry.',
    'Scores are for entertainment and presentation coaching only.',
  ];

  if (!landmarks || landmarks.length < 468) {
    return {
      faceDetected: false,
      facesCount: 0,
      detectionQuality: 0,
      symmetryEstimate: 0,
      canthalTilt: { angleDeg: 0, label: 'Neutral', score: 50, description: 'Landmarks unavailable' },
      facialWidthToHeightRatio: 1.4,
      jawToCheekRatio: 0.8,
      eyeSpacingRatio: 0.45,
      headPose: { pitch: 0, yaw: 0, roll: 0, isLevel: false },
      imageQuality,
      framingQuality: { isCentered: false, faceFillPercentage: 0, score: 0, feedback: 'No face detected in camera area' },
      availableMeasurements: [],
      limitations,
      analysisTimestamp: Date.now(),
    };
  }

  const p = (idx: number): NormalizedLandmark => landmarks[idx] || { x: 0.5, y: 0.5, z: 0 };

  const forehead = p(LANDMARK_INDEX.FOREHEAD_TOP);
  const chin = p(LANDMARK_INDEX.CHIN);
  const leftCheek = p(LANDMARK_INDEX.LEFT_CHEEK);
  const rightCheek = p(LANDMARK_INDEX.RIGHT_CHEEK);
  const leftJaw = p(LANDMARK_INDEX.LEFT_JAW_ANGLE);
  const rightJaw = p(LANDMARK_INDEX.RIGHT_JAW_ANGLE);
  const noseTip = p(LANDMARK_INDEX.NOSE_TIP);
  const noseBridge = p(LANDMARK_INDEX.NOSE_BRIDGE);
  const leftEyeOuter = p(LANDMARK_INDEX.LEFT_EYE_OUTER);
  const leftEyeInner = p(LANDMARK_INDEX.LEFT_EYE_INNER);
  const rightEyeOuter = p(LANDMARK_INDEX.RIGHT_EYE_OUTER);
  const rightEyeInner = p(LANDMARK_INDEX.RIGHT_EYE_INNER);

  // 1. Face Dimensions & Normalization Scale
  const faceHeight = Math.max(0.001, euclideanDist(forehead, chin));
  const faceWidth = Math.max(0.001, euclideanDist(leftCheek, rightCheek));
  const facialRatio = faceHeight / faceWidth;
  availableMeasurements.push('Facial Aspect Ratio');

  // 2. Head Pose (Roll, Pitch, Yaw in degrees)
  // Roll: tilt angle between the eyes
  const eyeDx = rightEyeOuter.x - leftEyeOuter.x;
  const eyeDy = rightEyeOuter.y - leftEyeOuter.y;
  const roll = (Math.atan2(eyeDy, eyeDx) * 180) / Math.PI;

  // Yaw: horizontal asymmetry of nose relative to eye corners
  const eyeMidX = (leftEyeInner.x + rightEyeInner.x) / 2;
  const yawOffset = (noseTip.x - eyeMidX) / faceWidth;
  const yaw = Math.max(-45, Math.min(45, yawOffset * 90));

  // Pitch: vertical offset of nose tip relative to bridge & chin
  const expectedNoseY = forehead.y + faceHeight * 0.55;
  const pitchOffset = (noseTip.y - expectedNoseY) / faceHeight;
  const pitch = Math.max(-40, Math.min(40, pitchOffset * 80));

  const isLevel = Math.abs(roll) < 8 && Math.abs(yaw) < 10 && Math.abs(pitch) < 10;
  const headPose: HeadPose = {
    pitch: Math.round(pitch * 10) / 10,
    yaw: Math.round(yaw * 10) / 10,
    roll: Math.round(roll * 10) / 10,
    isLevel,
  };
  availableMeasurements.push('Head Pose & Angle');

  // 3. Bilateral Symmetry Estimate
  // Measures distance of corresponding paired landmarks to the facial vertical midline
  const cheekDistL = distToLine(leftCheek, forehead, chin);
  const cheekDistR = distToLine(rightCheek, forehead, chin);
  const cheekAsymm = Math.abs(cheekDistL - cheekDistR) / Math.max(0.001, (cheekDistL + cheekDistR) / 2);

  const jawDistL = distToLine(leftJaw, forehead, chin);
  const jawDistR = distToLine(rightJaw, forehead, chin);
  const jawAsymm = Math.abs(jawDistL - jawDistR) / Math.max(0.001, (jawDistL + jawDistR) / 2);

  const eyeDistL = distToLine(leftEyeOuter, forehead, chin);
  const eyeDistR = distToLine(rightEyeOuter, forehead, chin);
  const eyeAsymm = Math.abs(eyeDistL - eyeDistR) / Math.max(0.001, (eyeDistL + eyeDistR) / 2);

  const avgDiscrepancy = (cheekAsymm + jawAsymm + eyeAsymm) / 3;
  // Raw symmetry score normalized to 0-100%
  // Typical human face asymmetry is around 2-8%
  const symmetryEstimate = Math.min(99, Math.max(45, Math.round(100 - avgDiscrepancy * 120)));
  availableMeasurements.push('Bilateral Landmark Symmetry');

  // 4. Canthal Tilt (Meme metric: angle of outer eye corner relative to inner corner)
  // Note: Canvas Y increases downwards, so a higher outer corner has a lower Y
  // Left eye (viewer's left): from inner to outer
  const leftEyeTiltRad = Math.atan2(leftEyeInner.y - leftEyeOuter.y, leftEyeOuter.x - leftEyeInner.x);
  // Right eye (viewer's right): from inner to outer
  const rightEyeTiltRad = Math.atan2(rightEyeInner.y - rightEyeOuter.y, rightEyeOuter.x - rightEyeInner.x);
  const avgTiltDeg = ((leftEyeTiltRad + rightEyeTiltRad) / 2) * (180 / Math.PI);
  const roundedTilt = Math.round(avgTiltDeg * 10) / 10;

  let canthalLabel: CanthalTilt['label'] = 'Neutral';
  let canthalScore = 75;
  let canthalDesc = 'Neutral canthal plane';

  if (roundedTilt >= 1.5) {
    canthalLabel = 'Positive (Hunter)';
    canthalScore = Math.min(98, 80 + Math.round(roundedTilt * 4));
    canthalDesc = `+${roundedTilt}° upward canthal axis detected`;
  } else if (roundedTilt <= -1.5) {
    canthalLabel = 'Negative';
    canthalScore = Math.max(50, 70 + Math.round(roundedTilt * 4));
    canthalDesc = `${roundedTilt}° resting down-slanted canthal plane`;
  } else {
    canthalLabel = 'Neutral';
    canthalScore = 78;
    canthalDesc = `${roundedTilt}° balanced horizontal eye axis`;
  }
  const canthalTilt: CanthalTilt = {
    angleDeg: roundedTilt,
    label: canthalLabel,
    score: canthalScore,
    description: canthalDesc,
  };
  availableMeasurements.push('Canthal Tilt Angle');

  // 5. Jaw-to-Cheek Ratio
  const jawWidth = euclideanDist(leftJaw, rightJaw);
  const cheekWidth = euclideanDist(leftCheek, rightCheek);
  const jawToCheekRatio = Math.round((jawWidth / Math.max(0.001, cheekWidth)) * 100) / 100;
  availableMeasurements.push('Jaw-to-Bizygomatic Ratio');

  // 6. Eye Spacing / Interpupillary distance
  const interpupillary = euclideanDist(
    { x: (leftEyeInner.x + leftEyeOuter.x) / 2, y: (leftEyeInner.y + leftEyeOuter.y) / 2, z: 0 },
    { x: (rightEyeInner.x + rightEyeOuter.x) / 2, y: (rightEyeInner.y + rightEyeOuter.y) / 2, z: 0 }
  );
  const eyeSpacingRatio = Math.round((interpupillary / Math.max(0.001, cheekWidth)) * 100) / 100;
  availableMeasurements.push('Interpupillary Breadth');

  // 7. Framing Quality & Centering
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;
  const faceArea = boxWidth * boxHeight;
  const faceFillPct = Math.round(faceArea * 100);

  const centerDeviation = Math.sqrt((centerX - 0.5) ** 2 + (centerY - 0.5) ** 2);
  const isCentered = centerDeviation < 0.12;

  let framingScore = 80;
  let framingFeedback = 'Great framing and position';
  if (!isCentered) {
    framingScore -= 20;
    framingFeedback = centerX < 0.45 ? 'Move slightly right' : centerX > 0.55 ? 'Move slightly left' : 'Center face in circle';
  }
  if (faceFillPct < 15) {
    framingScore -= 15;
    framingFeedback = 'Move closer to the camera';
  } else if (faceFillPct > 55) {
    framingScore -= 15;
    framingFeedback = 'Step back slightly for optimal perspective';
  }
  framingScore = Math.max(20, Math.min(100, framingScore));

  const framingQuality: FramingQuality = {
    isCentered,
    faceFillPercentage: faceFillPct,
    score: framingScore,
    feedback: framingFeedback,
  };
  availableMeasurements.push('Framing & Face Proximity');

  // Detection quality based on head pose, image quality, and landmark stability
  const detectionQuality = Math.round(
    (isLevel ? 35 : 20) +
    (imageQuality.isGoodQuality ? 35 : 20) +
    (isCentered ? 30 : 15)
  );

  return {
    faceDetected: true,
    facesCount,
    detectionQuality,
    symmetryEstimate,
    canthalTilt,
    facialWidthToHeightRatio: Math.round(facialRatio * 100) / 100,
    jawToCheekRatio,
    eyeSpacingRatio,
    headPose,
    imageQuality,
    framingQuality,
    availableMeasurements,
    limitations,
    analysisTimestamp: Date.now(),
  };
}
