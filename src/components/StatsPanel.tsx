import React from 'react';
import { 
  Users, 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  FileSpreadsheet, 
  RotateCcw, 
  Layers, 
  Eye, 
  Check, 
  Hash,
  Activity,
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { DetectedHead, DisplayOptions, DetectionMetrics, ImageMetadata, GroundTruthEvaluation } from '../types';
import { formatFileSize, exportDetectionsCSV } from '../utils/imageUtils';

interface StatsPanelProps {
  metadata: ImageMetadata;
  detections: DetectedHead[];
  metrics: DetectionMetrics | null;
  evaluation?: GroundTruthEvaluation | null;
  isProcessing: boolean;
  threshold: number;
  onThresholdChange: (newThreshold: number) => void;
  onTriggerDetection: () => void;
  onReset: () => void;
  displayOptions: DisplayOptions;
  onDisplayOptionsChange: (newOptions: DisplayOptions) => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  metadata,
  detections,
  metrics,
  evaluation,
  isProcessing,
  threshold,
  onThresholdChange,
  onTriggerDetection,
  onReset,
  displayOptions,
  onDisplayOptionsChange,
}) => {
  const hasDetections = detections.length > 0;

  const handleExportCSV = () => {
    exportDetectionsCSV(
      detections, 
      metadata, 
      evaluation ? {
        actualCount: evaluation.actualCount,
        error: evaluation.countError,
        accuracy: evaluation.accuracyRate,
      } : null
    );
  };

  return (
    <div className="space-y-5">
      {/* Primary KPI Card: Total Headcount */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Visible Headcount
            </span>
            <span className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
              <Users className="w-3.5 h-3.5" />
              Classroom Roster
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {detections.length}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {detections.length === 1 ? 'student head' : 'student heads'} detected
            </span>
          </div>

          {/* Quick Sub-Stats Strip */}
          {metrics && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Avg. Confidence</span>
                <span className="font-semibold text-slate-700 font-mono tabular-nums">
                  {(metrics.avgConfidence * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Inference Speed</span>
                <span className="font-semibold text-slate-700 font-mono tabular-nums">
                  {metrics.inferenceTimeMs} ms
                </span>
              </div>
            </div>
          )}

          {/* Confidence distribution buckets */}
          {metrics && detections.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100/80">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Confidence Distribution
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg text-center">
                  <span className="block font-bold">{metrics.confidenceBuckets?.high?? 0}</span>
                  <span className="text-[10px] text-emerald-600 font-sans">High ≥80%</span>
                </div>
                <div className="bg-blue-50 text-blue-800 p-1.5 rounded-lg text-center">
                  <span className="block font-bold">{metrics.confidenceBuckets?.mid?? 0}</span>
                  <span className="text-[10px] text-blue-600 font-sans">Mid 50-79%</span>
                </div>
                <div className="bg-amber-50 text-amber-800 p-1.5 rounded-lg text-center">
                  <span className="block font-bold">{metrics.confidenceBuckets?.low?? 0}</span>
                  <span className="text-[10px] text-amber-600 font-sans">Low &lt;50%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button: Count Heads */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onTriggerDetection}
          disabled={isProcessing}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 ${
            isProcessing
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.99]'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Image via MediaPipe...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{hasDetections ? 'Re-Count Heads' : 'Count Heads Now'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Upload Another Image / Reset</span>
        </button>
      </div>

      {/* Sensitivity / Confidence Threshold Slider */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Sensitivity Threshold
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            {Math.round(threshold * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0.10"
          max="0.85"
          step="0.05"
          value={threshold}
          onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-[11px] text-slate-400">
          <span>High Recall (Distant heads)</span>
          <span>High Precision (Fewer false hits)</span>
        </div>
      </div>

      {/* Visual Annotation Settings */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Annotation Options
          </span>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 text-xs text-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              Number Badges (#1, #2...)
            </span>
            <input
              type="checkbox"
              checked={displayOptions.showIds}
              onChange={(e) =>
                onDisplayOptionsChange({ ...displayOptions, showIds: e.target.checked })
              }
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Confidence Scores (%)
            </span>
            <input
              type="checkbox"
              checked={displayOptions.showConfidence}
              onChange={(e) =>
                onDisplayOptionsChange({ ...displayOptions, showConfidence: e.target.checked })
              }
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Facial Landmarks (Keypoints)
            </span>
            <input
              type="checkbox"
              checked={displayOptions.showLandmarks}
              onChange={(e) =>
                onDisplayOptionsChange({ ...displayOptions, showLandmarks: e.target.checked })
              }
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>
        </div>

        {/* Box Color Selector */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block mb-2">
            Box Theme Color
          </span>
          <div className="flex gap-2">
            {[
              { id: 'blue', label: 'Royal Blue', bg: 'bg-blue-600' },
              { id: 'green', label: 'Emerald', bg: 'bg-emerald-600' },
              { id: 'amber', label: 'Amber', bg: 'bg-amber-600' },
              { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-600' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  onDisplayOptionsChange({
                    ...displayOptions,
                    boxColor: c.id as DisplayOptions['boxColor'],
                  })
                }
                className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all ${
                  c.bg
                } ${
                  displayOptions.boxColor === c.id
                    ? 'ring-2 ring-offset-2 ring-slate-800 scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={c.label}
              >
                {displayOptions.boxColor === c.id && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Attendance CSV */}
      {hasDetections && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Export Roster
            </span>
            <span className="text-[11px] text-slate-400">CSV Spreadsheet</span>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV Attendance Report</span>
          </button>
        </div>
      )}

      {/* System Limitations Disclaimer */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>System Limitations & Detection Note</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Results reflect localized cranial landmarks. Students facing directly away (&gt;90°) or occluded behind monitors may require lowering the sensitivity slider.
        </p>
      </div>

      {/* File & Image Metadata */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 space-y-1.5 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">File Name</span>
          <span className="truncate max-w-[170px] text-slate-700" title={metadata.name}>
            {metadata.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">Resolution</span>
          <span className="text-slate-700">{metadata.width} × {metadata.height} px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">File Size</span>
          <span className="text-slate-700">{formatFileSize(metadata.sizeBytes)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">Format</span>
          <span className="text-slate-700 uppercase">{metadata.type.replace('image/', '')}</span>
        </div>
      </div>
    </div>
  );
};
