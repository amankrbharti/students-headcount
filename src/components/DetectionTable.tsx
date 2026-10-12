import React, { useState } from 'react';
import { DetectedHead } from '../types';
import { ArrowUpDown, Search, Focus } from 'lucide-react';

interface DetectionTableProps {
  detections: DetectedHead[];
  highlightedId: number | null;
  onHoverDetection: (id: number | null) => void;
  onSelectDetection: (id: number) => void;
}

export const DetectionTable: React.FC<DetectionTableProps> = ({
  detections,
  highlightedId,
  onHoverDetection,
  onSelectDetection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'score' | 'size'>('id');
  const [sortAsc, setSortAsc] = useState(true);

  if (detections.length === 0) {
    return null;
  }

  const handleSort = (field: 'id' | 'score' | 'size') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false); // default descending for scores
    }
  };

  const filteredDetections = detections
    .filter((d) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        d.id.toString().includes(term) ||
        Math.round(d.score * 100).toString().includes(term)
      );
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'id') diff = a.id - b.id;
      else if (sortBy === 'score') diff = a.score - b.score;
      else if (sortBy === 'size') {
        const areaA = a.box.width * a.box.height;
        const areaB = b.box.width * b.box.height;
        diff = areaA - areaB;
      }
      return sortAsc ? diff : -diff;
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Detected Head Manifest
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hover or click any row to highlight the corresponding bounding box on the image.
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search #ID or %"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-4 cursor-pointer hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Student ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="py-2.5 px-4 cursor-pointer hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Confidence Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('size')}
                className="py-2.5 px-4 cursor-pointer hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Box Size (W×H)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4">Coordinates (X, Y)</th>
              <th className="py-2.5 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDetections.map((det) => {
              const isSelected = det.id === highlightedId;
              const confidencePct = (det.score * 100).toFixed(1);
              return (
                <tr
                  key={det.id}
                  onMouseEnter={() => onHoverDetection(det.id)}
                  onMouseLeave={() => onHoverDetection(null)}
                  onClick={() => onSelectDetection(det.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 font-medium text-blue-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                    #{det.id}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums">{confidencePct}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${det.score * 100}%` }}
                          className={`h-full rounded-full ${
                            det.score > 0.7
                              ? 'bg-emerald-500'
                              : det.score > 0.4
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                    {Math.round(det.box.width)} × {Math.round(det.box.height)} px
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                    ({Math.round(det.box.xMin)}, {Math.round(det.box.yMin)})
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Focus on image"
                    >
                      <Focus className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
