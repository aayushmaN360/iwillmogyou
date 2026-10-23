export type RankTier = 
  | 'LEGENDARY MOGGER'
  | 'FINAL BOSS'
  | 'AURA FARMER'
  | 'MAIN CHARACTER'
  | 'SIDE CHARACTER'
  | 'NPC ENERGY';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HeadPose {
  pitch: number; // degrees nod up/down
  yaw: number;   // degrees turn left/right
  roll: number;  // degrees tilt ear to shoulder
  isLevel: boolean;
}

export interface ImageQualityMetrics {
  brightness: number; // 0-255
  contrast: number;   // std dev
  sharpnessScore: number; // 0-100
  isGoodQuality: boolean;
  lightingLabel: 'Underexposed' | 'Overexposed' | 'Harsh Shadows' | 'Balanced Lighting';
}

export interface FramingQuality {
  isCentered: boolean;
  faceFillPercentage: number; // ~15-45% is optimal
  score: number; // 0-100
  feedback: string;
}

export interface CanthalTilt {
  angleDeg: number;
  label: 'Positive (Hunter)' | 'Neutral' | 'Negative';
  score: number;
  description: string;
}

export interface FacialMeasurements {
  faceDetected: boolean;
  facesCount: number;
  detectionQuality: number; // 0-100
  symmetryEstimate: number; // 0-100%
  canthalTilt: CanthalTilt;
  facialWidthToHeightRatio: number; // typically 1.3 - 1.5
  jawToCheekRatio: number; // typically 0.7 - 0.95
  eyeSpacingRatio: number; // interpupillary / facial width
  headPose: HeadPose;
  imageQuality: ImageQualityMetrics;
  framingQuality: FramingQuality;
  availableMeasurements: string[];
  limitations: string[];
  analysisTimestamp: number;
}

export interface MogResult {
  mogScore: number; // 0-100
  auraPoints: number; // 1,000 to 10,000+
  rankTier: RankTier;
  rankSubtitle: string;
  verdict: string;
  quote: string;
  badgeColor: {
    bg: string;
    border: string;
    text: string;
    glow: string;
  };
  measurements: FacialMeasurements;
  actionableTips: string[];
  capturedImageUrl?: string;
  landmarks?: NormalizedLandmark[];
  shareCode?: string;
}

export interface ChallengeComparison {
  player1: MogResult & { name: string };
  player2: MogResult & { name: string };
  winner: 1 | 2 | 'tie';
  differential: number;
  verdict: string;
}
