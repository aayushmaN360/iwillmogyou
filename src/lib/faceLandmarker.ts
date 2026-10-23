import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { NormalizedLandmark } from '../types/analysis';

let landmarkerInstance: FaceLandmarker | null = null;
let loadPromise: Promise<FaceLandmarker> | null = null;
let loadError: Error | null = null;

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

/**
 * Initializes and caches the MediaPipe FaceLandmarker singleton
 */
export async function getFaceLandmarker(
  onProgress?: (message: string) => void
): Promise<FaceLandmarker> {
  if (landmarkerInstance) {
    return landmarkerInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      onProgress?.('Fetching computer vision binaries...');
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);

      onProgress?.('Initializing neural face mesh model...');
      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 3, // Detect up to 3 to warn about multiple faces
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      landmarkerInstance = landmarker;
      return landmarker;
    } catch (err) {
      console.error('Failed to load GPU MediaPipe FaceLandmarker, retrying on CPU delegate...', err);
      try {
        onProgress?.('Falling back to CPU neural delegate...');
        const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 3,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        landmarkerInstance = landmarker;
        return landmarker;
      } catch (cpuErr) {
        loadError = cpuErr instanceof Error ? cpuErr : new Error(String(cpuErr));
        loadPromise = null;
        throw loadError;
      }
    }
  })();

  return loadPromise;
}

/**
 * Perform face landmark detection on an HTMLImageElement or HTMLCanvasElement
 */
export async function detectFromImage(
  imageOrCanvas: HTMLImageElement | HTMLCanvasElement
): Promise<{ landmarks: NormalizedLandmark[][]; facesCount: number }> {
  const landmarker = await getFaceLandmarker();
  // Set running mode to IMAGE if currently in VIDEO
  await landmarker.setOptions({ runningMode: 'IMAGE' });
  const result = landmarker.detect(imageOrCanvas);
  // Restore running mode to VIDEO
  await landmarker.setOptions({ runningMode: 'VIDEO' });

  return {
    landmarks: (result.faceLandmarks as NormalizedLandmark[][]) || [],
    facesCount: result.faceLandmarks ? result.faceLandmarks.length : 0,
  };
}

/**
 * Creates canonical demo landmarks for simulation, testing, or reference demonstration
 */
export function createCanonicalDemoLandmarks(): NormalizedLandmark[] {
  const pts: NormalizedLandmark[] = [];
  // MediaPipe mesh has 468/478 landmarks. We'll populate a base canonical wireframe
  for (let i = 0; i < 478; i++) {
    // Generate canonical oval structure
    const angle = (i / 468) * Math.PI * 2;
    const rX = 0.22 + Math.sin(angle * 3) * 0.04;
    const rY = 0.32 + Math.cos(angle * 2) * 0.03;
    pts.push({
      x: 0.5 + Math.cos(angle) * rX,
      y: 0.5 + Math.sin(angle) * rY,
      z: Math.sin(angle) * 0.05,
    });
  }

  // Set accurate key landmarks
  pts[10] = { x: 0.5, y: 0.22, z: 0 }; // Forehead top
  pts[152] = { x: 0.5, y: 0.78, z: 0 }; // Chin
  pts[168] = { x: 0.5, y: 0.44, z: 0.05 }; // Nose bridge
  pts[1] = { x: 0.5, y: 0.53, z: 0.09 }; // Nose tip
  pts[2] = { x: 0.5, y: 0.58, z: 0.04 }; // Subnasale
  
  // Left eye (viewer's left)
  pts[33] = { x: 0.34, y: 0.44, z: 0 }; // outer
  pts[133] = { x: 0.43, y: 0.45, z: 0 }; // inner
  pts[159] = { x: 0.385, y: 0.42, z: 0 }; // top
  pts[145] = { x: 0.385, y: 0.47, z: 0 }; // bottom

  // Right eye (viewer's right)
  pts[362] = { x: 0.57, y: 0.45, z: 0 }; // inner
  pts[263] = { x: 0.66, y: 0.44, z: 0 }; // outer
  pts[386] = { x: 0.615, y: 0.42, z: 0 }; // top
  pts[374] = { x: 0.615, y: 0.47, z: 0 }; // bottom

  // Cheeks
  pts[234] = { x: 0.28, y: 0.52, z: 0 }; // left cheek
  pts[454] = { x: 0.72, y: 0.52, z: 0 }; // right cheek

  // Jaw corners
  pts[172] = { x: 0.32, y: 0.68, z: 0 }; // left jaw
  pts[397] = { x: 0.68, y: 0.68, z: 0 }; // right jaw

  // Mouth
  pts[61] = { x: 0.41, y: 0.66, z: 0 };
  pts[291] = { x: 0.59, y: 0.66, z: 0 };
  pts[0] = { x: 0.5, y: 0.64, z: 0 };
  pts[17] = { x: 0.5, y: 0.69, z: 0 };

  return pts;
}
