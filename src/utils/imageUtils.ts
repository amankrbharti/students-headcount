import { DetectedHead, DisplayOptions, ImageMetadata, HistoryItem } from '../types';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const HISTORY_STORAGE_KEY = 'students_headcount_history_v1';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateImageFile(file: File): ValidationResult {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  if (!validExtensions.includes(extension) && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: `Unsupported file format (.${extension}). Please upload JPG, JPEG, PNG, or WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      errorMessage: `File is too large (${sizeMb} MB). Maximum allowed size is 15 MB.`,
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const COLOR_THEMES = {
  blue: {
    stroke: '#2563EB', // Blue 600
    fill: 'rgba(37, 99, 235, 0.15)',
    badgeBg: '#1D4ED8',
    badgeText: '#FFFFFF',
    landmark: '#60A5FA',
    highlightStroke: '#EF4444',
  },
  green: {
    stroke: '#059669', // Emerald 600
    fill: 'rgba(5, 150, 105, 0.15)',
    badgeBg: '#047857',
    badgeText: '#FFFFFF',
    landmark: '#34D399',
    highlightStroke: '#F59E0B',
  },
  amber: {
    stroke: '#D97706', // Amber 600
    fill: 'rgba(217, 119, 6, 0.15)',
    badgeBg: '#B45309',
    badgeText: '#FFFFFF',
    landmark: '#FCD34D',
    highlightStroke: '#2563EB',
  },
  cyan: {
    stroke: '#0891B2', // Cyan 600
    fill: 'rgba(8, 145, 178, 0.15)',
    badgeBg: '#0E7490',
    badgeText: '#FFFFFF',
    landmark: '#67E8F9',
    highlightStroke: '#EC4899',
  },
};

/**
 * Draws the source image and high-fidelity detection annotations on a canvas
 */
export function drawAnnotatedCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  detections: DetectedHead[],
  options: DisplayOptions,
  highlightedId: number | null = null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  // If in raw mode or detections empty, do not draw bounding boxes
  if (options.viewMode === 'raw' || detections.length === 0) return;

  const theme = COLOR_THEMES[options.boxColor] || COLOR_THEMES.blue;
  const baseScale = Math.max(1, Math.min(canvas.width, canvas.height) / 1000);
  const strokeWidth = Math.max(2, Math.round(options.strokeWidth * baseScale));
  const fontSize = Math.max(12, Math.round(15 * baseScale));

  ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;

  detections.forEach((det) => {
    const isHighlighted = det.id === highlightedId;
    const { xMin, yMin, width, height } = det.box;

    // Bounding Box Background Fill
    ctx.fillStyle = isHighlighted ? 'rgba(239, 68, 68, 0.25)' : theme.fill;
    ctx.fillRect(xMin, yMin, width, height);

    // Bounding Box Outline
    ctx.strokeStyle = isHighlighted ? theme.highlightStroke : theme.stroke;
    ctx.lineWidth = isHighlighted ? strokeWidth + 2 : strokeWidth;
    ctx.strokeRect(xMin, yMin, width, height);

    // Optional Keypoints (landmarks like eyes, nose, ears)
    if (options.showLandmarks && det.keypoints) {
      const radius = Math.max(2, Math.round(3 * baseScale));
      ctx.fillStyle = theme.landmark;
      det.keypoints.forEach((kp) => {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Label Text
    if (options.showIds || options.showConfidence) {
      let labelText = '';
      if (options.showIds && options.showConfidence) {
        labelText = `#${det.id} · ${(det.score * 100).toFixed(0)}%`;
      } else if (options.showIds) {
        labelText = `#${det.id}`;
      } else if (options.showConfidence) {
        labelText = `${(det.score * 100).toFixed(0)}%`;
      }

      const textMetrics = ctx.measureText(labelText);
      const textPadding = Math.round(4 * baseScale);
      const badgeWidth = textMetrics.width + textPadding * 2;
      const badgeHeight = fontSize + textPadding * 2;

      const badgeY = yMin >= badgeHeight ? yMin - badgeHeight : yMin;
      const badgeX = xMin;

      // Badge Background
      ctx.fillStyle = isHighlighted ? theme.highlightStroke : theme.badgeBg;
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

      // Badge Text
      ctx.fillStyle = theme.badgeText;
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, badgeX + textPadding, badgeY + badgeHeight / 2);
    }
  });
}

/**
 * Creates a compact thumbnail string to store in localStorage
 */
export function createThumbnail(img: HTMLImageElement, maxDimension: number = 96): string {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * LocalStorage history management
 */
export function loadDetectionHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load history from localStorage:', err);
    return [];
  }
}

export function saveHistoryItem(item: HistoryItem): HistoryItem[] {
  try {
    const history = loadDetectionHistory();
    // Keep up to 15 recent items
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 15);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save item to localStorage:', err);
    return [];
  }
}

export function updateHistoryItemGroundTruth(id: string, actualCount: number): HistoryItem[] {
  try {
    const history = loadDetectionHistory();
    const updated = history.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          actualCount,
          countError: Math.abs(item.predictedCount - actualCount),
        };
      }
      return item;
    });
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to update ground truth in localStorage:', err);
    return [];
  }
}

export function clearDetectionHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}

/**
 * Calculates cumulative Mean Absolute Error (MAE) from evaluated history
 */
export function calculateCumulativeMAE(history: HistoryItem[]): { mae: number | null; evaluatedCount: number } {
  const evaluated = history.filter((h) => typeof h.countError === 'number');
  if (evaluated.length === 0) {
    return { mae: null, evaluatedCount: 0 };
  }
  const totalError = evaluated.reduce((acc, curr) => acc + (curr.countError ?? 0), 0);
  return {
    mae: parseFloat((totalError / evaluated.length).toFixed(2)),
    evaluatedCount: evaluated.length,
  };
}

/**
 * Downloads the current canvas content as a high-res PNG file
 */
export function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  fileName: string = 'headcount_annotated.png'
): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Exports detection results into a clean CSV format for attendance records
 */
export function exportDetectionsCSV(
  detections: DetectedHead[],
  imageMetadata?: ImageMetadata,
  evaluation?: { actualCount: number; error: number; accuracy: number } | null
): void {
  const headers = ['Head_ID', 'Confidence_Score', 'Confidence_Percent', 'Box_X_Min', 'Box_Y_Min', 'Box_Width', 'Box_Height'];
  const rows = detections.map((det) => [
    det.id,
    det.score.toFixed(4),
    `${(det.score * 100).toFixed(1)}%`,
    Math.round(det.box.xMin),
    Math.round(det.box.yMin),
    Math.round(det.box.width),
    Math.round(det.box.height),
  ]);

  const metaLines = [
    `# Student's Headcount — Detection & Attendance Manifest`,
    imageMetadata ? `# Image: ${imageMetadata.name} (${imageMetadata.width}x${imageMetadata.height}px)` : '',
    `# Total Detected Heads: ${detections.length}`,
    evaluation ? `# Ground Truth Manual Count: ${evaluation.actualCount}` : '',
    evaluation ? `# Count Error: ${evaluation.error} heads (Accuracy: ${evaluation.accuracy.toFixed(1)}%)` : '',
    `# Model: MediaPipe Full-Range Face Detector (TensorFlow.js WebGL)`,
    `# Exported: ${new Date().toISOString()}`,
    '',
  ].filter(Boolean);

  const csvContent =
    metaLines.join('\n') + '\n' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `headcount_report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
