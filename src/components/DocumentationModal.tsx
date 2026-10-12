import React from 'react';
import { X, BookOpen, CheckCircle, AlertTriangle, Cpu, HelpCircle, ShieldCheck } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Technical Documentation & Testing Protocol
              </h2>
              <p className="text-xs text-slate-500">
                Student's Headcount Computer Vision Architecture
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Section 1: How Detection Works */}
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              1. How Head Detection Works
            </h3>
            <p className="leading-relaxed">
              Unlike generic person detection models (which rely on full-body torsos and legs and frequently fail when students sit behind desks), this system utilizes the <strong>MediaPipe Face/Head Detector</strong> with the <strong>Full-Range model configuration</strong>.
            </p>
            <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-xs text-slate-700 pl-1">
              <li>
                <strong>Anchor-Based Architecture:</strong> Employs a single-shot detector optimized with mobile GPU/WebGL shaders for sub-100ms inference.
              </li>
              <li>
                <strong>Cranial Localization:</strong> Identifies cranial contours, eye/nose/mouth keypoints, and head orientations up to 5 meters in depth.
              </li>
              <li>
                <strong>Non-Maximum Suppression (NMS):</strong> Suppresses overlapping bounding boxes to prevent double-counting of the same student.
              </li>
              <li>
                <strong>Local GPU Execution:</strong> Processing runs entirely inside the client's browser using TensorFlow.js WebGL backend. Zero images leave the user's computer.
              </li>
            </ul>
          </div>

          {/* Section 2: System Limitations */}
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Known System Limitations
            </h3>
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <p>
                <strong>Important:</strong> Computer vision head detectors are statistical models and do not guarantee 100% detection under non-ideal conditions:
              </p>
              <ul className="space-y-1 list-disc list-inside pl-1">
                <li><strong>Back-Facing Students:</strong> Heads turned 180° away from the camera lack facial landmarks and may be missed.</li>
                <li><strong>Heavy Occlusion:</strong> Students sitting directly behind taller peers or obstructed by laptop screens/pillars.</li>
                <li><strong>Low Resolution / Distance:</strong> In deep lecture auditoriums (row 15+), heads under 20×20 pixels may fall below the model's receptive field. Uploading 1080p or 4K photos significantly improves back-row recall.</li>
                <li><strong>Extreme Lighting:</strong> Strong projector glare or deep shadows may cause partial misses.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Manual Testing Checklist */}
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              3. Manual Testing Checklist (Evaluation Guide)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Scenario</th>
                    <th className="p-3">Crowd Size</th>
                    <th className="p-3">Recommended Sensitivity</th>
                    <th className="p-3">Expected Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Seminar / Study Table</td>
                    <td className="p-3 font-mono">3–6 Students</td>
                    <td className="p-3 font-mono">40% – 50%</td>
                    <td className="p-3 text-emerald-700">100% precision with clear tight bounding boxes.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Standard Classroom</td>
                    <td className="p-3 font-mono">15–30 Students</td>
                    <td className="p-3 font-mono">30% – 40%</td>
                    <td className="p-3 text-emerald-700">High accuracy for all front and middle rows.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Large Lecture Auditorium</td>
                    <td className="p-3 font-mono">40–80+ Students</td>
                    <td className="p-3 font-mono">20% – 30%</td>
                    <td className="p-3 text-slate-700">Detects distant small heads; use Zoom tool to verify back rows.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Unsupported Format Check</td>
                    <td className="p-3 font-mono">N/A</td>
                    <td className="p-3 font-mono">N/A</td>
                    <td className="p-3 text-slate-700">Upload PDF or &gt;15MB file; system shows validation error.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Manual Verification Protocol */}
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              4. How to Verify Counting Accuracy Manually
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 pl-1 leading-relaxed">
              <li>
                <strong>Examine Sequential Numbers:</strong> Each detected head is stamped with a unique badge (<span className="font-mono font-bold">#1, #2, #3...</span>), sorted row-by-row.
              </li>
              <li>
                <strong>Cross-Reference with the Manifest Table:</strong> Use the Detection Manifest at the bottom to inspect each student's confidence score and exact bounding box dimensions.
              </li>
              <li>
                <strong>Fine-tune Sensitivity:</strong> If a distant head is missed, drag the Sensitivity slider left (e.g. to 25%). If background clutter creates a false positive, slide right (e.g. to 50%).
              </li>
              <li>
                <strong>Audit via Original Toggle:</strong> Click the "Raw / Annotated" button on the visual inspector to alternate between the original photo and the bounding boxes to spot any occluded students.
              </li>
            </ol>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800">Student Privacy Guarantee:</strong> All computer vision inference executes on the client device using browser hardware acceleration. Student photographs are never transmitted over the internet or saved to external databases.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
