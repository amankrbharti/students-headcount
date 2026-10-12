import React, { useState } from 'react';
import { 
  GraduationCap, 
  X, 
  Code2, 
  Cpu, 
  Layers, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  FileCode2, 
  Zap,
  Sliders,
  Maximize2
} from 'lucide-react';

interface PlacementPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlacementPrepModal: React.FC<PlacementPrepModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'math' | 'viva' | 'files'>('pipeline');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                CSE Project Defense & Placement Viva Guide
              </h2>
              <p className="text-xs text-slate-500">
                Technical explanations, algorithms, mathematical derivations & interviewer Q&A
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-slate-50/70 text-xs font-semibold text-slate-600">
          {[
            { id: 'pipeline', label: '1. CV Pipeline Architecture', icon: Cpu },
            { id: 'math', label: '2. Math: IoU, NMS & Box Geometry', icon: Layers },
            { id: 'viva', label: '3. Top 10 Viva / Interview Q&A', icon: HelpCircle },
            { id: 'files', label: '4. Codebase Walkthrough', icon: FileCode2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 bg-white font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 flex-1">
          {/* TAB 1: CV PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  End-to-End Image Processing Pipeline
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  When a classroom photo is submitted, the application executes a 5-stage computer vision workflow directly inside the client's browser without transferring binary data to external servers:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: 'Stage 1: Validation & Tensor Ingestion',
                    desc: 'The file format (JPG/PNG/WEBP) and size (<= 15MB) are verified. An HTMLImageElement is decoded and converted into a 3D Tensor of shape [height, width, 3] with pixel intensities normalized to float32 [0.0, 1.0].',
                  },
                  {
                    step: 'Stage 2: Neural Backbone Feature Extraction',
                    desc: 'The MediaPipe Full-Range Face Detector utilizes a lightweight Single Shot MultiBox Detector (SSD) backbone with custom depthwise separable convolutions to scan feature maps across multiple scales.',
                  },
                  {
                    step: 'Stage 3: Multi-Scale Anchor Generation',
                    desc: '896 predefined anchor boxes are mapped across the image pyramid. For each anchor, the network predicts offsets (dx, dy, dw, dh) and cranial probability confidence scores.',
                  },
                  {
                    step: 'Stage 4: Non-Maximum Suppression (NMS)',
                    desc: 'Because dense subjects produce overlapping bounding box candidates, an IoU-based NMS filter eliminates lower-confidence boxes that overlap existing selections with IoU >= 0.40.',
                  },
                  {
                    step: 'Stage 5: Coordinate Projection & Canvas Rendering',
                    desc: 'Normalized box coordinates are projected back to natural image resolution [0..W, 0..H]. Bounding boxes and badges (#1, #2...) are rendered onto HTML5 canvas with sub-pixel alignment.',
                  },
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-xs text-blue-900 block">{s.step}</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MATHEMATICS */}
          {activeTab === 'math' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  Key Mathematical Formulas & Algorithms
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  These mathematical concepts form the core evaluation criteria in engineering project reviews and machine learning interviews:
                </p>
              </div>

              {/* Formula 1: IoU */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">
                  1. Intersection-over-Union (IoU)
                </span>
                <p className="text-xs text-slate-600">
                  Measures the geometric overlap between two bounding boxes A and B:
                </p>
                <div className="bg-white p-3 rounded-lg border font-mono text-xs text-slate-800 text-center font-semibold">
                  IoU(A, B) = Area(A ∩ B) / Area(A ∪ B) = InterArea / (Area(A) + Area(B) - InterArea)
                </div>
                <p className="text-[11px] text-slate-500">
                  If IoU ≥ 0.40, the system treats the two proposals as belonging to the same head and retains only the higher confidence score.
                </p>
              </div>

              {/* Formula 2: MAE */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">
                  2. Mean Absolute Error (MAE)
                </span>
                <p className="text-xs text-slate-600">
                  Quantifies the average discrepancy between model predictions and ground-truth counts across K test photos:
                </p>
                <div className="bg-white p-3 rounded-lg border font-mono text-xs text-slate-800 text-center font-semibold">
                  MAE = (1 / K) * Σ |Predicted_i - Actual_i|
                </div>
                <p className="text-[11px] text-slate-500">
                  Unlike Mean Squared Error (MSE), MAE treats all headcount errors linearly, which is ideal for classroom attendance auditing.
                </p>
              </div>

              {/* Formula 3: Precision-Recall */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">
                  3. Sensitivity Threshold Trade-off (Precision vs. Recall)
                </span>
                <ul className="text-xs space-y-1 list-disc list-inside text-slate-600 pl-1">
                  <li><strong>Lower Threshold (e.g. 20%):</strong> Maximizes Recall. Catches small, distant heads in back rows, but slightly increases false positive risk.</li>
                  <li><strong>Higher Threshold (e.g. 70%):</strong> Maximizes Precision. Only accepts clear, high-confidence frontal faces, but may miss partially occluded heads.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: VIVA Q&A */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Top 10 Technical Viva & Interview Questions
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Prepared answers tailored for examiners, professors, and technical hiring managers:
              </p>

              {[
                {
                  q: 'Q1: Why did you choose a Face/Head detector rather than a YOLO Person detector?',
                  a: 'General person detectors (like YOLO on COCO) are trained on full-body silhouettes (legs, torso). In classrooms, 70-80% of students sit behind wooden desks and podiums, rendering whole-body features invisible. A dedicated cranial/face detector focuses specifically on head contours and facial landmarks, yielding much higher recall.',
                },
                {
                  q: 'Q2: How does the app prevent double-counting the same student?',
                  a: 'We implement Non-Maximum Suppression (NMS). When multiple candidate anchor boxes surround the same cranial region, IoU (Intersection-over-Union) is computed. All candidate boxes that overlap with the highest-scoring box by more than 40% (IoU >= 0.40) are suppressed.',
                },
                {
                  q: 'Q3: Why run inference client-side in the browser via WebGL instead of a backend Python server?',
                  a: '1) Privacy & Compliance: Student facial images never leave the client machine. 2) Zero Server Cost: Zero GPU compute bills or API egress bandwidth. 3) Offline Capability: Once cached by the service worker or browser cache, inference works without internet connection.',
                },
                {
                  q: 'Q4: What are the main failure modes of this system?',
                  a: '1) Heads turned 180° away from the camera lacking facial landmarks. 2) Severe physical occlusion (tall student sitting directly in front). 3) Distant heads occupying less than 20x20 pixels in low-resolution photos.',
                },
                {
                  q: 'Q5: How does the sensitivity threshold slider work in code?',
                  a: 'Raw candidate detections are estimated once by the neural model. The threshold slider dynamically filters candidates with score >= threshold and re-indexes remaining heads in sub-10ms without repeating heavy tensor graph evaluations.',
                },
                {
                  q: 'Q6: What is the time complexity of the Non-Maximum Suppression step?',
                  a: 'O(N log N) for sorting candidates by score, followed by O(N * M) for IoU comparisons against kept boxes, where N is the number of raw proposals (typically 20-100 in a classroom), executing in under 2ms.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                  <h4 className="font-bold text-xs text-blue-900">{item.q}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CODEBASE WALKTHROUGH */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Project Code Structure & Responsibilities
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Modular architecture adhering to industry single-responsibility principles:
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">File Path</th>
                      <th className="p-3">Module Responsibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-700">src/utils/detector.ts</td>
                      <td className="p-3 text-slate-600">Loads MediaPipe Face Detector with WebGL acceleration, runs inference, applies NMS filtering, and sorts coordinates row-by-row.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-700">src/utils/imageUtils.ts</td>
                      <td className="p-3 text-slate-600">Validates file types/sizes, draws high-contrast canvas bounding boxes, creates thumbnails, manages localStorage session history, and exports CSV.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-700">src/components/AnnotatedCanvas.tsx</td>
                      <td className="p-3 text-slate-600">Interactive canvas viewport with zoom (75%–300%), pan drag, Raw vs Annotated toggle, and Side-by-Side comparison mode.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-700">src/components/EvaluationCard.tsx</td>
                      <td className="p-3 text-slate-600">Allows entering manual ground-truth count, computes Count Error, accuracy rate %, and tracks cumulative session MAE.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-700">src/components/DetectionTable.tsx</td>
                      <td className="p-3 text-slate-600">Searchable and sortable manifest of all detected students with coordinates, confidence percentages, and hover highlight synchronization.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Suitable for B.Tech / B.E. / M.Tech Computer Science Major & Minor Projects
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
