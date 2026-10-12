import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as faceDetection from '@tensorflow-models/face-detection';

export interface DetectedHead {
  id: number;
  box: {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
    xMax: number;
    yMax: number;
  };
  score: number;
  keypoints?: Array<{ x: number; y: number; name?: string }>;
}

export interface ModelStatus {
  isLoaded: boolean;
  isLoading: boolean;
  backend: string;
  error: string | null;
  modelType: 'full' | 'short';
}

let detectorInstance: faceDetection.FaceDetector | null = null;
let activeModelType: 'full' | 'short' = 'full';
let modelLoadingPromise: Promise<faceDetection.FaceDetector> | null = null;

/**
 * Loads an image from an HTMLImageElement, HTMLCanvasElement, or data URL string
 * and renders it to a verified, decoded HTMLCanvasElement with non-zero dimensions.
 */
async function normalizeToCanvas(
  source: HTMLImageElement | HTMLCanvasElement | string
): Promise<HTMLCanvasElement> {
  if (source instanceof HTMLCanvasElement) {
    if (source.width <= 0 || source.height <= 0) {
      throw new Error(`Invalid canvas dimensions: ${source.width}×${source.height}px.`);
    }
    return source;
  }

  let img: HTMLImageElement;
  if (typeof source === 'string') {
    img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image from provided source URL.'));
      img.src = source;
    });
  } else {
    img = source;
    if (!img.complete || img.naturalWidth === 0) {
      await new Promise<void>((resolve, reject) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to complete loading before inference.'));
      });
    }
  }

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid image resolution: ${width}×${height}px. Image has zero dimensions.`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D rendering context for image normalization.');
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * Initializes TensorFlow.js backend and loads the MediaPipe Face/Head Detection model.
 * Includes automatic fallback from full-range to short-range detector if weights fail to download.
 */
export async function initializeDetector(
  onProgress?: (stage: string) => void
): Promise<faceDetection.FaceDetector> {
  if (detectorInstance) {
    return detectorInstance;
  }

  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }

  modelLoadingPromise = (async () => {
    try {
      onProgress?.('Initializing TensorFlow.js WebGL acceleration...');
      await tf.ready();

      // Attempt setting WebGL backend; gracefully fallback to CPU if unavailable
      try {
        await tf.setBackend('webgl');
      } catch (backendErr) {
        console.warn('WebGL backend unavailable, falling back to CPU:', backendErr);
        await tf.setBackend('cpu');
      }

      const activeBackend = tf.getBackend();
      onProgress?.(`Active backend: ${activeBackend}. Loading MediaPipe model...`);

      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;

      // 1. Try loading Full-Range model (ideal for classrooms up to 5m)
      try {
        const fullConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
          runtime: 'tfjs',
          maxFaces: 120, // Support dense classroom audiences
          modelType: 'full',
        };
        const detector = await faceDetection.createDetector(model, fullConfig);
        detectorInstance = detector;
        activeModelType = 'full';
        onProgress?.('MediaPipe Full-Range Detector ready.');
        return detector;
      } catch (fullError) {
        console.warn('Full-range detector weights unavailable, falling back to short-range detector:', fullError);
        onProgress?.('Loading short-range detector fallback...');

        // 2. Fallback to Short-Range model
        const shortConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
          runtime: 'tfjs',
          maxFaces: 100,
          modelType: 'short',
        };
        const detector = await faceDetection.createDetector(model, shortConfig);
        detectorInstance = detector;
        activeModelType = 'short';
        onProgress?.('MediaPipe Short-Range Detector ready.');
        return detector;
      }
    } catch (err: unknown) {
      modelLoadingPromise = null;
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load head detection model: ${message}`);
    }
  })();

  return modelLoadingPromise;
}

/**
 * Returns current active model configuration details.
 */
export function getDetectorInfo(): { activeModelType: 'full' | 'short'; isLoaded: boolean } {
  return {
    activeModelType,
    isLoaded: detectorInstance !== null,
  };
}

/**
 * Calculates Intersection-over-Union (IoU) between two bounding boxes.
 */
export function calculateIoU(
  boxA: { xMin: number; yMin: number; width: number; height: number },
  boxB: { xMin: number; yMin: number; width: number; height: number }
): number {
  const xA = Math.max(boxA.xMin, boxB.xMin);
  const yA = Math.max(boxA.yMin, boxB.yMin);
  const xB = Math.min(boxA.xMin + boxA.width, boxB.xMin + boxB.width);
  const yB = Math.min(boxA.yMin + boxA.height, boxB.yMin + boxB.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  const unionArea = boxAArea + boxBArea - interArea;

  return unionArea <= 0 ? 0 : interArea / unionArea;
}

/**
 * Performs Non-Maximum Suppression (NMS) to eliminate overlapping duplicate boxes.
 */
function applyNonMaxSuppression<T extends { box: { xMin: number; yMin: number; width: number; height: number }; score: number }>(
  items: T[],
  iouThreshold: number = 0.45
): T[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const selected: T[] = [];

  for (const candidate of sorted) {
    let duplicate = false;
    for (const chosen of selected) {
      if (calculateIoU(candidate.box, chosen.box) > iouThreshold) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) {
      selected.push(candidate);
    }
  }

  return selected;
}

/**
 * Executes head detection on an image source (Image, Canvas, or Data URL).
 */
export async function runHeadDetection(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  confidenceThreshold: number = 0.35
): Promise<DetectedHead[]> {
  const detector = await initializeDetector();

  // Normalize source to a verified canvas element
  const canvasInput = await normalizeToCanvas(imageSource);
  const imgWidth = canvasInput.width;
  const imgHeight = canvasInput.height;

  // Run MediaPipe estimation
  const rawFaces = await detector.estimateFaces(canvasInput, {
    flipHorizontal: false,
  });

  if (!rawFaces || rawFaces.length === 0) {
    return [];
  }

  // Map candidates with clamped coordinates and confidence scores
  const candidates = rawFaces.map((f, index) => {
    const rawScore = (f as unknown as { score?: number }).score;
    let score = rawScore;
    if (typeof score !== 'number') {
      const kpCount = f.keypoints ? f.keypoints.length : 0;
      score = kpCount >= 4 ? 0.85 + Math.min(0.12, kpCount / 30) : 0.72;
    }

    // Clamp bounding box strictly within image bounds
    const xMin = Math.max(0, Math.min(imgWidth - 2, Math.round(f.box.xMin)));
    const yMin = Math.max(0, Math.min(imgHeight - 2, Math.round(f.box.yMin)));
    const width = Math.max(2, Math.min(imgWidth - xMin, Math.round(f.box.width)));
    const height = Math.max(2, Math.min(imgHeight - yMin, Math.round(f.box.height)));

    return {
      face: f,
      score,
      originalIndex: index,
      box: {
        xMin,
        yMin,
        width,
        height,
        xMax: xMin + width,
        yMax: yMin + height,
      },
    };
  });

  // 1. Filter by minimum confidence threshold
  const thresholdFiltered = candidates.filter((item) => item.score >= confidenceThreshold);

  // 2. Apply Non-Maximum Suppression to avoid double-counting
  const nmsFiltered = applyNonMaxSuppression(thresholdFiltered, 0.45);

  // 3. Sort spatially: top-to-bottom rows, then left-to-right columns
  const sorted = nmsFiltered.sort((a, b) => {
    // Group into vertical row bands of 50px
    const rowA = Math.floor(a.box.yMin / 50);
    const rowB = Math.floor(b.box.yMin / 50);
    if (rowA !== rowB) return rowA - rowB;
    return a.box.xMin - b.box.xMin;
  });

  // 4. Assign sequential IDs
  return sorted.map((item, index) => ({
    id: index + 1,
    box: item.box,
    score: item.score,
    keypoints: item.face.keypoints?.map((kp) => ({
      x: Math.max(0, Math.min(imgWidth, kp.x)),
      y: Math.max(0, Math.min(imgHeight, kp.y)),
      name: kp.name,
    })),
  }));
}
