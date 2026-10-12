export interface BoundingBox {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
  xMax?: number;
  yMax?: number;
}

export interface Keypoint {
  x: number;
  y: number;
  name?: string;
}

export interface DetectedHead {
  id: number;
  box: BoundingBox;
  score: number;
  keypoints?: Keypoint[];
}

export interface ImageMetadata {
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  type: string;
  aspectRatio: string;
}

export interface DisplayOptions {
  showIds: boolean;
  showConfidence: boolean;
  showLandmarks: boolean;
  boxColor: 'blue' | 'green' | 'amber' | 'cyan';
  strokeWidth: number;
  boxOpacity: number;
  viewMode: 'annotated' | 'raw' | 'sideBySide';
}

export interface DetectionMetrics {
  inferenceTimeMs: number;
  totalCount: number;
  avgConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  confidenceBuckets: {
    high: number; // >= 80%
    mid: number; // 50% - 79%
    low: number; // < 50%
  };
}

export interface GroundTruthEvaluation {
  actualCount: number;
  predictedCount: number;
  countError: number;
  accuracyRate: number; // 0% - 100%
  status: 'exact' | 'undercount' | 'overcount';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageName: string;
  predictedCount: number;
  actualCount?: number;
  countError?: number;
  threshold: number;
  inferenceTimeMs: number;
  thumbnailUrl: string;
}
