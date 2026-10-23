import {
  FacialMeasurements,
  MogResult,
  RankTier,
} from '../types/analysis';

export interface ScoreWeights {
  symmetry: number;
  lightingQuality: number;
  framing: number;
  headLevel: number;
  canthalBonus: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  symmetry: 0.35,
  lightingQuality: 0.25,
  framing: 0.20,
  headLevel: 0.15,
  canthalBonus: 0.05,
};

/**
 * Computes deterministic Mog Score (0-100) and Aura Points from measurements
 */
export function calculateMogScore(measurements: FacialMeasurements, weights = DEFAULT_WEIGHTS): number {
  if (!measurements.faceDetected) {
    return 0;
  }

  // Symmetry contributes up to 35 points (symmetry is typically between 50-98%)
  const symNorm = Math.max(0, Math.min(100, measurements.symmetryEstimate));
  const symScore = symNorm * weights.symmetry;

  // Lighting & Clarity contributes up to 25 points
  const brightnessScore = Math.max(0, 100 - Math.abs(measurements.imageQuality.brightness - 128) * 1.2);
  const sharpness = Math.min(100, measurements.imageQuality.sharpnessScore * 1.2);
  const lightScore = ((brightnessScore * 0.5) + (sharpness * 0.5)) * weights.lightingQuality;

  // Framing contributes up to 20 points
  const frameScore = measurements.framingQuality.score * weights.framing;

  // Head level contributes up to 15 points
  const posePenalty = Math.abs(measurements.headPose.roll) * 1.5 + Math.abs(measurements.headPose.yaw) * 1.0 + Math.abs(measurements.headPose.pitch) * 0.8;
  const levelScore = Math.max(0, 100 - posePenalty * 2.5) * weights.headLevel;

  // Canthal tilt nuance (up to 5 bonus points)
  const canthalScore = measurements.canthalTilt.score * weights.canthalBonus;

  const totalRaw = symScore + lightScore + frameScore + levelScore + canthalScore;

  // Normalize deterministic result into 15 - 98 range
  const finalScore = Math.round(Math.min(99, Math.max(12, totalRaw)));
  return finalScore;
}

export function determineRankTier(score: number): RankTier {
  if (score >= 95) return 'LEGENDARY MOGGER';
  if (score >= 80) return 'FINAL BOSS';
  if (score >= 60) return 'AURA FARMER';
  if (score >= 40) return 'MAIN CHARACTER';
  if (score >= 20) return 'SIDE CHARACTER';
  return 'NPC ENERGY';
}

export function getRankTierDetails(tier: RankTier, score: number) {
  switch (tier) {
    case 'LEGENDARY MOGGER':
      return {
        subtitle: 'Peak Aesthetic Hierarchy',
        verdict: 'Transcendental aura. The room immediately goes silent when you enter.',
        quote: '“It’s not just mogging—it’s an art form.”',
        badgeColor: {
          bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20',
          border: 'border-yellow-400/50',
          text: 'text-yellow-300',
          glow: 'rgba(255, 200, 87, 0.4)',
        },
      };
    case 'FINAL BOSS':
      return {
        subtitle: 'Uncompromising Dominance',
        verdict: 'Heavy main-character energy detected. Strong structure and magnetic presence.',
        quote: '“They thought they were the protagonist until you entered the frame.”',
        badgeColor: {
          bg: 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20',
          border: 'border-cyan-400/50',
          text: 'text-cyan-300',
          glow: 'rgba(0, 229, 255, 0.35)',
        },
      };
    case 'AURA FARMER':
      return {
        subtitle: 'High Kinetic Presence',
        verdict: 'Sharp visual momentum. Consistent angles with high charisma leverage.',
        quote: '“Passively harvesting aura from everyone within a 15-meter radius.”',
        badgeColor: {
          bg: 'bg-cyan-500/15',
          border: 'border-cyan-500/40',
          text: 'text-cyan-400',
          glow: 'rgba(0, 229, 255, 0.25)',
        },
      };
    case 'MAIN CHARACTER':
      return {
        subtitle: 'Solid Center-Stage Appeal',
        verdict: 'Reliable presence and great camera engagement. Primed for greatness.',
        quote: '“The plot revolves around you, but the training arc is just beginning.”',
        badgeColor: {
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          glow: 'rgba(61, 123, 255, 0.25)',
        },
      };
    case 'SIDE CHARACTER':
      return {
        subtitle: 'Support Squad Royalty',
        verdict: 'Loyal companion tier. One sharp haircut away from stealing the show.',
        quote: '“You get an entire filler episode dedicated to your backstory.”',
        badgeColor: {
          bg: 'bg-slate-700/30',
          border: 'border-slate-500/40',
          text: 'text-slate-300',
          glow: 'rgba(148, 163, 184, 0.2)',
        },
      };
    case 'NPC ENERGY':
    default:
      return {
        subtitle: 'Spawn Point Novice',
        verdict: 'Camera angle needs immediate calibration. Lighting is running on power-saver mode.',
        quote: '“Standing near the village fountain waiting for an adventurer to press E.”',
        badgeColor: {
          bg: 'bg-zinc-800/40',
          border: 'border-zinc-700/40',
          text: 'text-zinc-400',
          glow: 'rgba(113, 113, 122, 0.15)',
        },
      };
  }
}

/**
 * Generate actionable presentation tips based on real metrics
 */
export function generatePresentationTips(m: FacialMeasurements): string[] {
  const tips: string[] = [];

  // Lighting
  if (m.imageQuality.lightingLabel === 'Underexposed') {
    tips.push('Elevate Lighting: Position yourself facing a diffused window or soft ring light to fill shadows.');
  } else if (m.imageQuality.lightingLabel === 'Harsh Shadows') {
    tips.push('Soften Angle: Avoid overhead downlights that cast deep orbital shadows; choose front 45° key lighting.');
  } else if (m.imageQuality.lightingLabel === 'Overexposed') {
    tips.push('Tone Down Highlights: Step slightly back from direct intense light sources to prevent highlight burnout.');
  } else {
    tips.push('Lighting Precision: Current illumination is clean—maintain this soft directional baseline.');
  }

  // Camera angle and pose
  if (Math.abs(m.headPose.pitch) > 12) {
    tips.push(
      m.headPose.pitch > 0
        ? 'Chin Leveling: Raise your camera lens up to eye level rather than tilting your chin down.'
        : 'Posture Alignment: Lower lens slightly to eye level to avoid shooting from below.'
    );
  }
  if (Math.abs(m.headPose.roll) > 8) {
    tips.push('Camera Balance: Keep camera strictly parallel to the horizon to maximize bilateral symmetry presentation.');
  }

  // Distance / Framing
  if (m.framingQuality.faceFillPercentage < 20) {
    tips.push('Lens Proximity: Bring phone closer (ideal focal portrait distance is 18–24 inches / arm’s length).');
  } else if (m.framingQuality.faceFillPercentage > 50) {
    tips.push('Reduce Distortion: Back away slightly and use 2x optical zoom to eliminate wide-angle nose distortion.');
  }

  // Presentation & Grooming styling inspiration
  if (m.jawToCheekRatio < 0.78) {
    tips.push('Jawline Enhancement: A textured square crop or slight stubble adds balanced lateral jaw definition.');
  } else {
    tips.push('Facial Structure: Your jaw breadth is prominent; faded tapers or swept-back styles accentuate bone structure.');
  }

  return tips.slice(0, 4);
}

/**
 * Deterministically generates the complete MogResult
 */
export function generateMogResult(
  measurements: FacialMeasurements,
  capturedImageUrl?: string
): MogResult {
  const mogScore = calculateMogScore(measurements);
  // Aura points: deterministic multiplier with base bonus
  const auraPoints = Math.round(mogScore * 95 + (measurements.symmetryEstimate * 8.5));
  const rankTier = determineRankTier(mogScore);
  const details = getRankTierDetails(rankTier, mogScore);
  const actionableTips = generatePresentationTips(measurements);

  // Generate deterministic short share code
  const shareCode = `MOG-${mogScore.toString(16).toUpperCase()}-${Math.abs(measurements.symmetryEstimate).toString(16).toUpperCase()}`;

  return {
    mogScore,
    auraPoints,
    rankTier,
    rankSubtitle: details.subtitle,
    verdict: details.verdict,
    quote: details.quote,
    badgeColor: details.badgeColor,
    measurements,
    actionableTips,
    capturedImageUrl,
    shareCode,
  };
}
