import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UploadArea } from './components/UploadArea';
import { AnnotatedCanvas } from './components/AnnotatedCanvas';
import { StatsPanel } from './components/StatsPanel';
import { DetectionTable } from './components/DetectionTable';
import { DocumentationModal } from './components/DocumentationModal';
import { 
  DetectedHead, 
  DisplayOptions, 
  DetectionMetrics, 
  ImageMetadata 
} from './types';
import { initializeDetector, runHeadDetection } from './utils/detector';
import { AlertCircle, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import * as tf from '@tensorflow/tfjs-core';

export default function App() {
  // Model state
  const [modelStatus, setModelStatus] = useState({
    isLoaded: false,
    isLoading: true,
    backend: 'webgl',
    error: null as string | null,
  });

  // Image & Detection state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [rawDetections, setRawDetections] = useState<DetectedHead[]>([]);
  const [filteredDetections, setFilteredDetections] = useState<DetectedHead[]>([]);
  const [metrics, setMetrics] = useState<DetectionMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Settings
  const [threshold, setThreshold] = useState<number>(0.35);

const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
  showIds: true,
  showConfidence: true,
  showLandmarks: false,
  boxColor: 'blue',
  strokeWidth: 3,
  boxOpacity: 0.15,
  viewMode: 'annotated',
});


  // UI state
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Initialize TensorFlow.js and MediaPipe Model on application mount
  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        await initializeDetector();
        if (isMounted) {
          setModelStatus({
            isLoaded: true,
            isLoading: false,
            backend: tf.getBackend() || 'webgl',
            error: null,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('Model initialization error:', err);
          setModelStatus({
            isLoaded: false,
            isLoading: false,
            backend: 'none',
            error: msg,
          });
          setErrorMessage('Could not initialize MediaPipe detector. Check console or WebGL support.');
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update filtered detections whenever threshold or raw detections change
  useEffect(() => {
    if (rawDetections.length > 0) {
      const filtered = rawDetections.filter((d) => d.score >= threshold);
      // Re-assign sequential IDs based on current filtered set
      const renumbered = filtered.map((d, index) => ({
        ...d,
        id: index + 1,
      }));
      setFilteredDetections(renumbered);

      if (renumbered.length > 0) {
        const scores = renumbered.map((d) => d.score);
        const sum = scores.reduce((a, b) => a + b, 0);
        setMetrics((prev) =>
          prev
            ? {
                ...prev,
                totalCount: renumbered.length,
                avgConfidence: sum / renumbered.length,
                minConfidence: Math.min(...scores),
                maxConfidence: Math.max(...scores),
              }
            : null
        );
      } else {
        setMetrics((prev) =>
          prev
            ? {
                ...prev,
                totalCount: 0,
                avgConfidence: 0,
                minConfidence: 0,
                maxConfidence: 0,
              }
            : null
        );
      }
    } else {
      setFilteredDetections([]);
    }
  }, [threshold, rawDetections]);

  // Handler for image selection (Upload, Camera, or Sample)
  const handleImageSelected = useCallback((dataUrl: string, meta: ImageMetadata) => {
    setImageSrc(dataUrl);
    setMetadata(meta);
    setRawDetections([]);
    setFilteredDetections([]);
    setMetrics(null);
    setHasProcessed(false);
    setErrorMessage(null);
    setHighlightedId(null);
  }, []);

  // Run Head Detection via MediaPipe
  const handleCountHeads = async () => {
    if (!imageSrc) {
      setErrorMessage('Please select or upload an image first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      // Pass imageSrc directly to runHeadDetection which normalizes and decodes it safely
      const allDetections = await runHeadDetection(imageSrc, 0.1);
      const endTime = performance.now();
      const elapsedMs = Math.round(endTime - startTime);

      setRawDetections(allDetections);
      setHasProcessed(true);

      const activeFiltered = allDetections.filter((d) => d.score >= threshold);
      const scores = activeFiltered.map((d) => d.score);
      const avgConf = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

     
setMetrics({
  inferenceTimeMs: elapsedMs,
  totalCount: activeFiltered.length,
  avgConfidence: avgConf,
  minConfidence: scores.length > 0 ? Math.min(...scores) : 0,
  maxConfidence: scores.length > 0 ? Math.max(...scores) : 0,
  confidenceBuckets: {
    high: scores.filter((score) => score >= 0.8).length,
    mid: scores.filter((score) => score >= 0.5 && score < 0.8).length,
    low: scores.filter((score) => score < 0.5).length,
  },
});


      if (activeFiltered.length === 0 && allDetections.length > 0) {
        setErrorMessage(
          `Found ${allDetections.length} candidate heads below current ${Math.round(threshold * 100)}% threshold. Lower the Sensitivity slider to reveal them.`
        );
      }
    } catch (err: unknown) {
      console.error('Detection error:', err);
      const msg = err instanceof Error ? err.message : 'Computer vision model failed to process image.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setMetadata(null);
    setRawDetections([]);
    setFilteredDetections([]);
    setMetrics(null);
    setHasProcessed(false);
    setErrorMessage(null);
    setHighlightedId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Top Navbar */}
     
<Navbar
  modelStatus={modelStatus}
  onOpenDocs={() => setIsDocsOpen(true)}
  onOpenPlacementGuide={() => setIsDocsOpen(true)}
  onOpenHistory={() => setIsDocsOpen(true)}
  historyCount={0}
/>


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Toast / Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-rose-900">
                  Notification
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View 1: Empty Upload State */}
        {!imageSrc ? (
          <div className="space-y-8">
            {/* Header intro */}
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                Academic Computer Vision Suite
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Classroom Attendance & Headcount Analysis
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                Utilize neural head and cranial localization to accurately count visible students in group photographs, lectures, and seminars without collecting private biometric identities.
              </p>
            </div>

            {/* Upload Area */}
            <UploadArea
              onImageSelected={handleImageSelected}
              onError={(msg) => setErrorMessage(msg)}
            />

            {/* Feature Highlights Bento Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
                  01
                </div>
                <h3 className="font-bold text-sm text-slate-900">Head-Specific Model</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Trained specifically on cranial geometry, cranial contours, and seated perspectives where torsos are hidden by desks.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h3 className="font-bold text-sm text-slate-900">Non-Maximum Suppression</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Eliminates redundant overlapping candidate boxes to ensure each student is counted precisely once.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h3 className="font-bold text-sm text-slate-900">Privacy-First Architecture</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Zero server upload. All neural tensor evaluations execute entirely within your browser's local WebGL environment.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Active Workspace with Selected Image */
          <div className="space-y-6">
            {/* Top Workspace Breadcrumb & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-900">{metadata?.name}</span>
                <span aria-hidden="true">·</span>
                <span>{metadata?.width}×{metadata?.height} px</span>
                <span aria-hidden="true">·</span>
                {hasProcessed ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Detection Complete
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Ready for Analysis</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  Change Image
                </button>
              </div>
            </div>

            {/* Split Grid: Canvas on Left, Controls on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Center: Interactive Annotated Canvas */}
              <div className="lg:col-span-8 space-y-6">
                {metadata && (
                  <AnnotatedCanvas
                    imageSrc={imageSrc}
                    metadata={metadata}
                    detections={filteredDetections}
                    displayOptions={displayOptions}
                    highlightedId={highlightedId}
                    onSelectDetection={(id) => setHighlightedId(id)}
                  />
                )}

                {/* Status Callout if not processed yet */}
                {!hasProcessed && (
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-blue-900">
                          Image Loaded Successfully
                        </h4>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Click "Count Heads Now" in the control panel to run head localization.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCountHeads}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      Count Heads
                    </button>
                  </div>
                )}

                {/* Table of Detected Heads */}
                {hasProcessed && (
                  <DetectionTable
                    detections={filteredDetections}
                    highlightedId={highlightedId}
                    onHoverDetection={(id) => setHighlightedId(id)}
                    onSelectDetection={(id) => setHighlightedId(id)}
                  />
                )}
              </div>

              {/* Right Sidebar: Controls & Stats */}
              <div className="lg:col-span-4">
                {metadata && (
                  <StatsPanel
                    metadata={metadata}
                    detections={filteredDetections}
                    metrics={metrics}
                    isProcessing={isProcessing}
                    threshold={threshold}
                    onThresholdChange={setThreshold}
                    onTriggerDetection={handleCountHeads}
                    onReset={handleReset}
                    displayOptions={displayOptions}
                    onDisplayOptionsChange={setDisplayOptions}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Student's Headcount</span>
            <span className="text-slate-400">·</span>
            <span>Computer Vision Head Counting System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-blue-600 transition-colors"
            >
              Methodology & Limitations
            </button>
            <span className="text-slate-300">·</span>
            <span>Local WebGL Inference</span>
          </div>
        </div>
      </footer>

      {/* Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
