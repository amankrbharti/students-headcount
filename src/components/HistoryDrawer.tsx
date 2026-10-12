import React from 'react';
import { History, Trash2, Calendar, Clock, BarChart, ChevronRight, X } from 'lucide-react';
import { HistoryItem } from '../types';
import { clearDetectionHistory } from '../utils/imageUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem?: (item: HistoryItem) => void;
  cumulativeMae: number | null;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
  cumulativeMae,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Local Detection History
              </h2>
              <p className="text-xs text-slate-500">
                Session logs saved to browser localStorage (private & offline)
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

        {/* Overview Strip */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Total Logged Runs: <strong className="text-slate-900">{history.length}</strong>
            </span>
            {cumulativeMae !== null && (
              <span className="text-blue-700 font-semibold flex items-center gap-1">
                <BarChart className="w-3.5 h-3.5" />
                Cumulative MAE: {cumulativeMae}
              </span>
            )}
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Logs
            </button>
          )}
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-600">No detection logs recorded yet</p>
              <p className="text-xs">
                Upload or test classroom photos and click "Count Heads Now" to track runs.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 truncate" title={item.imageName}>
                      {item.imageName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span>Sens: {Math.round(item.threshold * 100)}%</span>
                      <span>·</span>
                      <span>{item.inferenceTimeMs}ms</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold font-mono text-blue-700">
                    {item.predictedCount} <span className="text-xs font-normal text-slate-500">heads</span>
                  </div>
                  {item.actualCount !== undefined && (
                    <div className="text-[11px] text-slate-500">
                      Actual: <span className="font-mono">{item.actualCount}</span> (Err: <span className="font-mono">{item.countError}</span>)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
