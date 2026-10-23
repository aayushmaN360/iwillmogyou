import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMogScore,
  determineRankTier,
  generateMogResult,
  generatePresentationTips,
} from './scoringEngine';
import { FacialMeasurements } from '../types/analysis';

function createMockMeasurements(overrides: Partial<FacialMeasurements> = {}): FacialMeasurements {
  return {
    faceDetected: true,
    facesCount: 1,
    detectionQuality: 90,
    symmetryEstimate: 88,
    canthalTilt: {
      angleDeg: 3.5,
      label: 'Positive (Hunter)',
      score: 92,
      description: '+3.5° upward canthal axis detected',
    },
    facialWidthToHeightRatio: 1.42,
    jawToCheekRatio: 0.82,
    eyeSpacingRatio: 0.46,
    headPose: {
      pitch: 1.2,
      yaw: 0.8,
      roll: -0.5,
      isLevel: true,
    },
    imageQuality: {
      brightness: 125,
      contrast: 48,
      sharpnessScore: 78,
      isGoodQuality: true,
      lightingLabel: 'Balanced Lighting',
    },
    framingQuality: {
      isCentered: true,
      faceFillPercentage: 28,
      score: 90,
      feedback: 'Great framing and position',
    },
    availableMeasurements: ['Bilateral Landmark Symmetry', 'Canthal Tilt Angle'],
    limitations: ['2D planar approximation'],
    analysisTimestamp: 1700000000000,
    ...overrides,
  };
}

test('returns 0 when no face is detected', () => {
  const m = createMockMeasurements({ faceDetected: false });
  assert.equal(calculateMogScore(m), 0);
});

test('produces 100% deterministic score for identical inputs', () => {
  const m1 = createMockMeasurements();
  const m2 = createMockMeasurements();
  const score1 = calculateMogScore(m1);
  const score2 = calculateMogScore(m2);
  assert.equal(score1, score2);

  const res1 = generateMogResult(m1);
  const res2 = generateMogResult(m2);
  assert.equal(res1.mogScore, res2.mogScore);
  assert.equal(res1.auraPoints, res2.auraPoints);
  assert.equal(res1.rankTier, res2.rankTier);
  assert.equal(res1.shareCode, res2.shareCode);
});

test('maps score correctly to designated rank tiers', () => {
  assert.equal(determineRankTier(98), 'LEGENDARY MOGGER');
  assert.equal(determineRankTier(95), 'LEGENDARY MOGGER');
  assert.equal(determineRankTier(88), 'FINAL BOSS');
  assert.equal(determineRankTier(80), 'FINAL BOSS');
  assert.equal(determineRankTier(72), 'AURA FARMER');
  assert.equal(determineRankTier(55), 'MAIN CHARACTER');
  assert.equal(determineRankTier(35), 'SIDE CHARACTER');
  assert.equal(determineRankTier(14), 'NPC ENERGY');
});

test('generates helpful presentation tips when lighting is underexposed or angle is off', () => {
  const mDark = createMockMeasurements({
    imageQuality: {
      brightness: 40,
      contrast: 20,
      sharpnessScore: 40,
      isGoodQuality: false,
      lightingLabel: 'Underexposed',
    },
    headPose: {
      pitch: 18,
      yaw: 2,
      roll: 0,
      isLevel: false,
    },
  });

  const tips = generatePresentationTips(mDark);
  assert.ok(tips.some(t => t.toLowerCase().includes('lighting') || t.toLowerCase().includes('shadows')));
  assert.ok(tips.some(t => t.toLowerCase().includes('leveling') || t.toLowerCase().includes('chin') || t.toLowerCase().includes('angle')));
});
