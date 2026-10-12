import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Calculator, TrendingUp, BarChart2, Save } from 'lucide-react';
import { GroundTruthEvaluation } from '../types';

interface EvaluationCardProps {
  predictedCount: number;
  initialActual?: number;
  onEvaluate: (evaluation: GroundTruthEvaluation) => void;
  cumulativeMae: number | null;
  evaluatedHistoryCount: number;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  predictedCount,
  initialActual,
  onEvaluate,
  cumulativeMae,
  evaluatedHistoryCount,
}) => {
  const [actualInput, setActualInput] = useState<string>(
    initialActual !== undefined ? String(initialActual) : ''
  );
  const [evaluation, setEvaluation] = useState<GroundTruthEvaluation | null>(null);

  useEffect(() => {
    if (initialActual !== undefined) {
      setActualInput(String(initialActual));
      computeEvaluation(initialActual);
    } else {
      setActualInput('');
      setEvaluation(null);
    }
  }, [initialActual, predictedCount]);

  const computeEvaluation = (actualVal: number) => {
    const error = Math.abs(predictedCount - actualVal);
    const denominator = Math.max(1, actualVal);
    const accuracy = Math.max(0, Math.min(100, (1 - error / denominator) * 100));

    let status: GroundTruthEvaluation['status'] = 'exact';
    if (predictedCount < actualVal) status = 'undercount';
    else if (predictedCount > actualVal) status = 'overcount';

    const result: GroundTruthEvaluation = {
      actualCount: actualVal,
      predictedCount,
      countError: error,
      accuracyRate: parseFloat(accuracy.toFixed(1)),
      status,
    };

    setEvaluation(result);
    onEvaluate(result);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setActualInput(val);
    if (val === '') {
      setEvaluation(null);
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      computeEvaluation(num);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Ground-Truth Accuracy Evaluation
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Mini Project Metric</span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Verify the model by entering the manually observed student count. The system computes Count Error and session Mean Absolute Error (MAE).
      </p>

      {/* Input row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            Manual Ground-Truth Count
          </label>
          <input
            type="number"
            min="0"
            max="300"
            placeholder="e.g. 4 or 8"
            value={actualInput}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Model Estimate</span>
          <div className="px-3 py-2 text-sm font-mono font-bold bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            {predictedCount} {predictedCount === 1 ? 'head' : 'heads'}
          </div>
        </div>
      </div>

      {/* Calculated Result Breakdown */}
      {evaluation && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Count Error</span>
              <span className="font-mono font-bold text-slate-900 text-base">
                {evaluation.countError} {evaluation.countError === 1 ? 'student' : 'students'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Accuracy</span>
              <span
                className={`font-mono font-bold text-base ${
                  evaluation.accuracyRate >= 90
                    ? 'text-emerald-700'
                    : evaluation.accuracyRate >= 70
                    ? 'text-blue-700'
                    : 'text-amber-700'
                }`}
              >
                {evaluation.accuracyRate}%
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[11px]">Detection Status</span>
              <span className="font-semibold text-xs flex items-center gap-1 mt-0.5">
                {evaluation.status === 'exact' ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exact Match
                  </span>
                ) : evaluation.status === 'undercount' ? (
                  <span className="text-amber-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Under-counted ({evaluation.countError})
                  </span>
                ) : (
                  <span className="text-blue-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Over-counted (+{evaluation.countError})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cumulative MAE Benchmark */}
      {cumulativeMae !== null && (
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-bold text-blue-900 block">
                Mean Absolute Error (MAE): {cumulativeMae}
              </span>
              <span className="text-[11px] text-blue-700">
                Calculated across {evaluatedHistoryCount} benchmarked tests
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
