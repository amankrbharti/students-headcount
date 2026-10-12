import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Camera, AlertCircle, Sparkles, X, RefreshCw } from 'lucide-react';
import { validateImageFile } from '../utils/imageUtils';
import { ImageMetadata } from '../types';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface UploadAreaProps {
  onImageSelected: (dataUrl: string, metadata: ImageMetadata, expectedCount?: number) => void;
  onError: (msg: string) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const processFile = useCallback((file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      onError(validation.errorMessage || 'Invalid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const metadata: ImageMetadata = {
          name: file.name,
          sizeBytes: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          type: file.type || 'image/jpeg',
          aspectRatio: `${(img.naturalWidth / img.naturalHeight).toFixed(2)}:1`,
        };
        onImageSelected(dataUrl, metadata, undefined);
      };
      img.onerror = () => {
        onError('Unable to decode image file. Please choose another image.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      onError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  }, [onError, onImageSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleSelectSample = (sample: typeof SAMPLE_IMAGES[0]) => {
    const dataUrl = sample.createDataUrl();
    const img = new Image();
    img.onload = () => {
      const metadata: ImageMetadata = {
        name: `${sample.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
        sizeBytes: Math.round(dataUrl.length * 0.75),
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: 'image/jpeg',
        aspectRatio: `${(img.naturalWidth / img.naturalHeight).toFixed(2)}:1`,
      };
      onImageSelected(dataUrl, metadata, sample.expectedCount);
    };
    img.src = dataUrl;
  };

  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Webcam Capture Handlers
  const startCamera = async () => {
    setCameraError(null);

    // If mediaDevices is unsupported, fallback immediately to system camera picker
    if (!navigator?.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: unknown) {
      console.warn('Live webcam access prevented or denied:', err);
      setCameraError(
        'Camera permission was denied by the browser. You can still use the "Device Camera" or "Browse Image" option below.'
      );
      setIsCameraActive(true); // Open modal with clear fallback buttons
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();

    const metadata: ImageMetadata = {
      name: `webcam_snapshot_${Date.now()}.jpg`,
      sizeBytes: Math.round(dataUrl.length * 0.75),
      width: canvas.width,
      height: canvas.height,
      type: 'image/jpeg',
      aspectRatio: `${(canvas.width / canvas.height).toFixed(2)}:1`,
    };
    onImageSelected(dataUrl, metadata);
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Main Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isCameraActive && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-white ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 scale-[1.005]'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/70 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Upload Classroom or Group Photo
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Drag & drop your photograph here, or browse from your computer.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm hover:shadow transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              Browse Image
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-all border border-slate-200"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              Live Camera
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Supports JPG, JPEG, PNG, WEBP</span>
            <span aria-hidden="true">·</span>
            <span>Max 15 MB</span>
          </div>
        </div>
      </div>

      {/* Live Camera Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Live Camera Snapshot</h3>
              </div>
              <button
                onClick={stopCamera}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!cameraError ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-3">
                <div className="flex items-start gap-2.5 text-amber-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Camera Access Blocked in Browser</strong>
                    <span>{cameraError}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Open Device Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Browse Existing Image
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  Take Snapshot
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden input for OS Camera capture fallback */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Preset Test Images Strip */}
      <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-700 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Quick Test Presets (Zero Upload Required)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-left bg-white hover:bg-blue-50/50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs group"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                  {sample.title}
                </h4>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {sample.studentCountLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
