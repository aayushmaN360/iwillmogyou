import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, RotateCw, AlertTriangle, CheckCircle, X, Shield, RefreshCw } from 'lucide-react';
import { getFaceLandmarker, detectFromImage } from '../lib/faceLandmarker';
import { calculateFacialMeasurements } from '../lib/facialMeasurements';
import { evaluateImageQuality } from '../lib/imageQuality';
import { generateMogResult } from '../lib/scoringEngine';
import { drawFaceMeshOverlay } from '../lib/faceMeshRenderer';
import { soundFx } from '../lib/soundEffects';
import { MogResult, NormalizedLandmark } from '../types/analysis';

interface CameraScannerProps {
  onScanComplete: (result: MogResult) => void;
  onCancel: () => void;
  initialMode?: 'camera' | 'upload';
}

type ScanStage =
  | 'idle'
  | 'initializing'
  | 'locating_landmarks'
  | 'analyzing_geometry'
  | 'checking_quality'
  | 'generating_rank'
  | 'completed';

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScanComplete,
  onCancel,
  initialMode = 'camera',
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>(initialMode);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<string>('Initializing AI engine...');
  const [modelError, setModelError] = useState<string | null>(null);

  // Scan sequence state
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100
  const [guidanceMessage, setGuidanceMessage] = useState<string>('Align face inside the framing guides');
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);

  // Uploaded photo state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef(false);
  const detectedLandmarksRef = useRef<NormalizedLandmark[] | null>(null);

  // Stop camera helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Pre-load MediaPipe FaceLandmarker model
  useEffect(() => {
    let mounted = true;
    getFaceLandmarker(msg => {
      if (mounted) setModelStatus(msg);
    })
      .then(() => {
        if (mounted) {
          setModelStatus('AI Neural Mesh Ready');
          setModelError(null);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error('Failed to load FaceLandmarker:', err);
          setModelError('Could not load AI vision weights. Please check your internet connection and retry.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setPermissionError(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access. Please use modern Safari, Chrome, or Firefox.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }
    } catch (err: unknown) {
      console.error('Camera stream error:', err);
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission was denied. Please allow camera access in your browser settings to perform a live scan.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionError('No camera found on this device. You can still upload a photo below.');
      } else {
        setPermissionError(error.message || 'Unable to access device camera.');
      }
      setCameraActive(false);
    }
  }, [facingMode, stopCameraStream]);

  // Start camera when mode is 'camera'
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCameraStream();
    }
  }, [mode, startCamera, stopCameraStream]);

  // Real-time video frame tracking loop
  useEffect(() => {
    if (!cameraActive || mode !== 'camera') return;

    let lastVideoTime = -1;

    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.currentTime !== lastVideoTime && video.videoWidth > 0 && ctx) {
        lastVideoTime = video.currentTime;

        // Ensure canvas matches video resolution
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
          const landmarker = await getFaceLandmarker();
          const timestamp = performance.now();
          const detection = landmarker.detectForVideo(video, timestamp);

          if (detection.faceLandmarks && detection.faceLandmarks.length > 0) {
            const faces = detection.faceLandmarks.length;
            setFaceDetected(true);
            setMultipleFaces(faces > 1);

            const primaryLandmarks = detection.faceLandmarks[0] as NormalizedLandmark[];
            detectedLandmarksRef.current = primaryLandmarks;

            if (faces > 1) {
              setGuidanceMessage('MULTIPLE FACES DETECTED — ONLY ONE PERSON ALLOWED');
              // Draw in warning red/amber
              drawFaceMeshOverlay(ctx, primaryLandmarks, canvas.width, canvas.height, {
                color: '#FF5555',
                pulseGlow: 0.9,
              });
            } else {
              // Analyze quick positioning
              const nose = primaryLandmarks[1];
              const eyeL = primaryLandmarks[33];
              const eyeR = primaryLandmarks[263];
              const eyeRoll = Math.abs((Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x) * 180) / Math.PI);

              if (nose && (nose.x < 0.35 || nose.x > 0.65 || nose.y < 0.3 || nose.y > 0.7)) {
                setGuidanceMessage('CENTER YOUR FACE INSIDE RETICLE');
              } else if (eyeRoll > 15) {
                setGuidanceMessage('KEEP HEAD LEVEL FOR BEST ACCURACY');
              } else {
                setGuidanceMessage('PERFECT POSITION — READY TO SCAN');
              }

              // Draw cyan cybernetic mesh overlay
              drawFaceMeshOverlay(ctx, primaryLandmarks, canvas.width, canvas.height, {
                color: isScanningRef.current ? '#FFC857' : '#00E5FF',
                showMeshLines: true,
                showContours: true,
                showPoints: true,
                pulseGlow: 1.0,
              });
            }
          } else {
            setFaceDetected(false);
            setMultipleFaces(false);
            detectedLandmarksRef.current = null;
            setGuidanceMessage('FACE NOT DETECTED — CENTER YOUR FACE');
          }
        } catch {
          // Frame dropped or busy
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, mode]);

  // Run the 5-stage live scan sequence
  const startLiveScanSequence = async () => {
    if (!faceDetected || multipleFaces || !detectedLandmarksRef.current || !videoRef.current) {
      soundFx.playBlip(300);
      return;
    }

    isScanningRef.current = true;
    soundFx.playTargetLock();

    // Stage 1: Initializing
    setScanStage('initializing');
    setScanProgress(15);
    soundFx.playScanningTone();
    await new Promise(r => setTimeout(r, 600));

    // Stage 2: Locating Landmarks
    setScanStage('locating_landmarks');
    setScanProgress(38);
    soundFx.playScanningTone();
    await new Promise(r => setTimeout(r, 650));

    // Stage 3: Analyzing Face Geometry
    setScanStage('analyzing_geometry');
    setScanProgress(65);
    soundFx.playScanningTone();
    await new Promise(r => setTimeout(r, 700));

    // Capture snapshot from video
    const video = videoRef.current;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth || 640;
    snapCanvas.height = video.videoHeight || 480;
    const snapCtx = snapCanvas.getContext('2d');
    let capturedDataUrl: string | undefined = undefined;
    if (snapCtx) {
      snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
      capturedDataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
    }

    // Stage 4: Checking Image Quality
    setScanStage('checking_quality');
    setScanProgress(85);
    const imageQuality = evaluateImageQuality(snapCanvas);
    await new Promise(r => setTimeout(r, 600));

    // Stage 5: Generating Rank
    setScanStage('generating_rank');
    setScanProgress(98);
    soundFx.playRevealFanfare();
    await new Promise(r => setTimeout(r, 500));

    // Calculate actual measurements and deterministic result
    const measurements = calculateFacialMeasurements(
      detectedLandmarksRef.current,
      imageQuality,
      1
    );

    const result = generateMogResult(measurements, capturedDataUrl);
    result.landmarks = detectedLandmarksRef.current;

    stopCameraStream();
    isScanningRef.current = false;
    setScanStage('completed');
    onScanComplete(result);
  };

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = evt => {
      const src = evt.target?.result as string;
      setUploadedImageSrc(src);
      soundFx.playBlip(800);
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  // Process uploaded image with real MediaPipe FaceLandmarker
  const processUploadedPhoto = async () => {
    if (!uploadedImageSrc) return;
    setIsProcessingUpload(true);
    setUploadError(null);
    soundFx.playTargetLock();

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.src = uploadedImageSrc;
      });

      // Draw onto canvas to measure image quality
      const offCanvas = document.createElement('canvas');
      offCanvas.width = img.naturalWidth || img.width;
      offCanvas.height = img.naturalHeight || img.height;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.drawImage(img, 0, 0);

      const imageQuality = evaluateImageQuality(offCanvas);

      // Detect landmarks
      const { landmarks, facesCount } = await detectFromImage(img);

      if (facesCount === 0 || landmarks.length === 0) {
        setUploadError('No face detected in this photo. Please upload a clear, front-facing portrait with good lighting.');
        setIsProcessingUpload(false);
        soundFx.playBlip(300);
        return;
      }

      if (facesCount > 1) {
        setUploadError('Multiple faces detected. Please upload a photo with only one individual in the frame.');
        setIsProcessingUpload(false);
        soundFx.playBlip(300);
        return;
      }

      soundFx.playRevealFanfare();
      const primaryLandmarks = landmarks[0];
      const measurements = calculateFacialMeasurements(primaryLandmarks, imageQuality, facesCount);
      const result = generateMogResult(measurements, uploadedImageSrc);
      result.landmarks = primaryLandmarks;

      setIsProcessingUpload(false);
      onScanComplete(result);
    } catch (err: unknown) {
      console.error('Error analyzing photo:', err);
      const error = err as { message?: string };
      setUploadError(error.message || 'An error occurred during photo analysis. Please try another image.');
      setIsProcessingUpload(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090D]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
      
      {/* Top Header Controls */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span>FACIAL TELEMETRY SCANNER</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                {mode === 'camera' ? 'LIVE FEED' : 'STATIC PHOTO'}
              </span>
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">{modelStatus}</p>
          </div>
        </div>

        <button
          onClick={() => {
            stopCameraStream();
            soundFx.playBlip(500);
            onCancel();
          }}
          className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          aria-label="Cancel scan"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="w-full max-w-md my-3 bg-[#10141C] p-1 rounded-xl border border-zinc-800 flex gap-1">
        <button
          onClick={() => {
            soundFx.playBlip(750);
            setMode('camera');
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            mode === 'camera'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera Scan</span>
        </button>

        <button
          onClick={() => {
            soundFx.playBlip(750);
            setMode('upload');
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            mode === 'upload'
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Main Scanner Viewport Container */}
      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center relative my-2">
        {mode === 'camera' ? (
          <div className="relative w-full aspect-[3/4] max-h-[580px] bg-black rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(0,229,255,0.15)] flex items-center justify-center">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

            {/* Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />

            {/* Canvas Face Mesh Overlay */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                facingMode === 'user' ? '-scale-x-100' : ''
              }`}
            />

            {/* Moving Laser Scan Line (active during scan) */}
            {scanStage !== 'idle' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline shadow-[0_0_20px_#00E5FF] z-20 pointer-events-none" />
            )}

            {/* HUD Face Alignment Frame */}
            <div className="absolute inset-8 sm:inset-12 border border-cyan-400/25 rounded-3xl pointer-events-none flex items-center justify-center">
              {/* Corner Reticles */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Inner Ellipse Framing Guide */}
              <div
                className={`w-4/5 h-4/5 rounded-full border-2 border-dashed transition-colors duration-300 ${
                  faceDetected && !multipleFaces
                    ? 'border-cyan-400/70 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                    : multipleFaces
                    ? 'border-red-500/80 shadow-[0_0_20px_rgba(255,0,0,0.3)]'
                    : 'border-zinc-500/40'
                }`}
              />
            </div>

            {/* Live Guidance Pill */}
            <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide backdrop-blur-md border shadow-lg flex items-center gap-2 ${
                  multipleFaces
                    ? 'bg-red-950/80 border-red-500 text-red-200'
                    : faceDetected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                    : 'bg-zinc-900/80 border-zinc-700 text-zinc-300'
                }`}
              >
                {multipleFaces ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                ) : faceDetected ? (
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
                <span>{guidanceMessage}</span>
              </div>
            </div>

            {/* Switch Camera Button (if device supports multiple cameras) */}
            <button
              onClick={() => {
                soundFx.playBlip(700);
                setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
              }}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-[#10141C]/80 border border-zinc-700 hover:border-cyan-500 text-zinc-300 hover:text-cyan-400 backdrop-blur-md transition-colors"
              title="Switch Camera (Front/Back)"
              aria-label="Switch Camera"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Permission Denied Recovery Banner */}
            {permissionError && (
              <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Camera Access Required</h3>
                <p className="text-xs text-zinc-300 max-w-xs">{permissionError}</p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold uppercase flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={() => setMode('upload')}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold uppercase"
                  >
                    Upload Photo Instead
                  </button>
                </div>
              </div>
            )}

            {/* AI Model Failure Banner */}
            {modelError && (
              <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <h3 className="text-base font-bold text-white">Vision Engine Offline</h3>
                <p className="text-xs text-zinc-300 max-w-xs">{modelError}</p>
              </div>
            )}

            {/* Scan Sequence Progress Overlay */}
            {scanStage !== 'idle' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-4 z-30">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)]" />
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block">
                    STAGE {scanStage === 'initializing' ? '1/5' : scanStage === 'locating_landmarks' ? '2/5' : scanStage === 'analyzing_geometry' ? '3/5' : scanStage === 'checking_quality' ? '4/5' : '5/5'}
                  </span>
                  <p className="text-base font-black text-white uppercase tracking-wider">
                    {scanStage === 'initializing' && 'INITIALIZING SCANNER...'}
                    {scanStage === 'locating_landmarks' && 'LOCATING 468 FACIAL LANDMARKS...'}
                    {scanStage === 'analyzing_geometry' && 'ANALYZING BILATERAL SYMMETRY & CANTHAL TILT...'}
                    {scanStage === 'checking_quality' && 'CHECKING LIGHTING & SHARPNESS...'}
                    {scanStage === 'generating_rank' && 'GENERATING MEME RANK & AURA...'}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="w-full max-w-xs bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_10px_#00E5FF]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Upload Photo View */
          <div className="w-full aspect-[3/4] max-h-[580px] bg-[#10141C] rounded-2xl overflow-hidden border-2 border-dashed border-zinc-700 hover:border-cyan-500/50 p-6 flex flex-col items-center justify-center text-center relative transition-colors">
            {uploadedImageSrc ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={uploadedImageSrc}
                  alt="Uploaded face preview"
                  className="max-h-[380px] max-w-full rounded-xl object-contain border border-cyan-500/30 shadow-lg"
                />
                <div className="mt-4 flex gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200">
                    Replace Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() => setUploadedImageSrc(null)}
                    className="px-4 py-2 rounded-lg bg-red-950/60 text-red-300 border border-red-800/60 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-base font-extrabold text-white block">Click to select a photograph</span>
                  <span className="text-xs text-zinc-400 block">PNG, JPG, or WebP up to 15MB</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 max-w-xs space-y-1 pt-2">
                  <p>• Face camera directly</p>
                  <p>• Keep face centered with even lighting</p>
                  <p>• Avoid sunglasses or heavy obstructions</p>
                </div>
                
                {/* Instant Sample Portrait Button for quick testing */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Generate a crisp sample portrait using a canvas
                      const c = document.createElement('canvas');
                      c.width = 400;
                      c.height = 500;
                      const ctx = c.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#10141C';
                        ctx.fillRect(0, 0, 400, 500);
                        // Draw stylized neutral face
                        ctx.fillStyle = '#E0AC69';
                        ctx.beginPath();
                        ctx.ellipse(200, 240, 95, 130, 0, 0, Math.PI * 2);
                        ctx.fill();
                        // Hair
                        ctx.fillStyle = '#2A1B14';
                        ctx.beginPath();
                        ctx.arc(200, 190, 105, Math.PI, Math.PI * 2);
                        ctx.fill();
                        // Eyes
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.ellipse(160, 220, 16, 9, 0.05, 0, Math.PI * 2);
                        ctx.ellipse(240, 220, 16, 9, -0.05, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#3A2E2B';
                        ctx.beginPath();
                        ctx.arc(160, 220, 7, 0, Math.PI * 2);
                        ctx.arc(240, 220, 7, 0, Math.PI * 2);
                        ctx.fill();
                        // Nose
                        ctx.strokeStyle = '#B37D46';
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.moveTo(200, 220);
                        ctx.lineTo(196, 255);
                        ctx.lineTo(206, 255);
                        ctx.stroke();
                        // Mouth
                        ctx.fillStyle = '#C46D66';
                        ctx.beginPath();
                        ctx.ellipse(200, 290, 22, 7, 0, 0, Math.PI * 2);
                        ctx.fill();
                      }
                      setUploadedImageSrc(c.toDataURL('image/png'));
                      soundFx.playBlip(800);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800/80 text-[11px] font-mono text-cyan-300 transition-colors"
                  >
                    + Load Demo Face Photo
                  </button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {uploadError && (
              <div className="absolute bottom-4 inset-x-6 p-3 rounded-lg bg-red-950/90 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="w-full max-w-lg pt-3 border-t border-zinc-800 flex flex-col items-center gap-3">
        {mode === 'camera' ? (
          <button
            onClick={startLiveScanSequence}
            disabled={!faceDetected || multipleFaces || scanStage !== 'idle'}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
              faceDetected && !multipleFaces && scanStage === 'idle'
                ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_25px_rgba(0,229,255,0.4)] cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>
              {scanStage !== 'idle'
                ? 'SCANNING IN PROGRESS...'
                : multipleFaces
                ? 'ONE PERSON ONLY'
                : faceDetected
                ? 'COMPLETE SCAN'
                : 'CENTER FACE TO SCAN'}
            </span>
          </button>
        ) : (
          <button
            onClick={processUploadedPhoto}
            disabled={!uploadedImageSrc || isProcessingUpload}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              uploadedImageSrc && !isProcessingUpload
                ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_25px_rgba(0,229,255,0.4)] cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            {isProcessingUpload ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>ANALYZING IMAGE TELEMETRY...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>ANALYZE SELECTED PHOTO</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local client-side execution. Camera feed is never broadcast.</span>
        </div>
      </div>
    </div>
  );
};
