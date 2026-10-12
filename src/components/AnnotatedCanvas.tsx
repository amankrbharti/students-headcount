import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Eye, EyeOff } from 'lucide-react';
import { DetectedHead, DisplayOptions, ImageMetadata } from '../types';
import { drawAnnotatedCanvas, downloadCanvasImage } from '../utils/imageUtils';

interface AnnotatedCanvasProps {
  imageSrc: string;
  metadata: ImageMetadata;
  detections: DetectedHead[];
  displayOptions: DisplayOptions;
  highlightedId: number | null;
  onSelectDetection?: (id: number) => void;
}

export const AnnotatedCanvas: React.FC<AnnotatedCanvasProps> = ({
  imageSrc,
  metadata,
  detections,
  displayOptions,
  highlightedId,
  onSelectDetection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load and redraw with cached image support for zero-latency hover
  useEffect(() => {
    if (imgRef.current && imgRef.current.src === imageSrc) {
      if (canvasRef.current) {
        drawAnnotatedCanvas(
          canvasRef.current,
          imgRef.current,
          showOriginal ? [] : detections,
          displayOptions,
          highlightedId
        );
      }
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      if (canvasRef.current) {
        drawAnnotatedCanvas(
          canvasRef.current,
          img,
          showOriginal ? [] : detections,
          displayOptions,
          highlightedId
        );
      }
    };
    img.src = imageSrc;
  }, [imageSrc, detections, displayOptions, highlightedId, showOriginal]);

  const handleZoomIn = () => setZoom((prev) => Math.min(3, prev + 0.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.75, prev - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleDownload = () => {
    if (canvasRef.current) {
      const baseName = metadata.name.replace(/\.[^/.]+$/, '');
      downloadCanvasImage(canvasRef.current, `${baseName}_headcount_annotated.png`);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      {/* Top Canvas Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-300 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Visual Inspector</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-400">
            {metadata.width}×{metadata.height}px
          </span>
          {detections.length > 0 && (
            <>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-medium">
                {detections.length} boxes active
              </span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Raw vs Annotated */}
          {detections.length > 0 && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                showOriginal
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={showOriginal ? 'Showing Raw Photo' : 'Show Original Photo'}
            >
              {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showOriginal ? 'Raw' : 'Annotated'}</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white rounded hover:bg-slate-700"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-400 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white rounded hover:bg-slate-700"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetView}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700"
            title="Reset view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Download Snapshot */}
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-xs"
            title="Export annotated image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full overflow-hidden bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[620px] select-none ${
          zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            transformOrigin: 'center center',
          }}
          className="max-w-full max-h-full flex items-center justify-center p-2"
        >
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[580px] object-contain rounded-lg shadow-2xl block"
          />
        </div>

        {/* Hover Hint on Zoom */}
        {zoom > 1 && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-slate-400 border border-slate-700 pointer-events-none">
            Drag to pan view
          </div>
        )}
      </div>
    </div>
  );
};
