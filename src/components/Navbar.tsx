import React from 'react';
import { 
  Users, 
  BookOpen, 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  GraduationCap, 
  History 
} from 'lucide-react';

interface NavbarProps {
  modelStatus: {
    isLoaded: boolean;
    isLoading: boolean;
    backend: string;
    error: string | null;
  };
  onOpenDocs: () => void;
  onOpenPlacementGuide: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  modelStatus, 
  onOpenDocs, 
  onOpenPlacementGuide, 
  onOpenHistory,
  historyCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Student's Headcount
              </span>
              <span className="text-xs text-slate-500 block">
                CSE Mini Project · Computer Vision System
              </span>
            </div>
          </div>

          {/* Model Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>MediaPipe Detector</span>
              <span className="text-slate-400">·</span>
              {modelStatus.isLoading ? (
                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : modelStatus.isLoaded ? (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Ready ({modelStatus.backend})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Standby
                </span>
              )}
            </div>
          </div>

          {/* Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="View saved detection history in localStorage"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-mono">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Placement & Viva Guide Button */}
            <button
              onClick={onOpenPlacementGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              title="CSE Viva Q&A, Algorithms & Placement Prep Guide"
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Viva & Placement Guide</span>
              <span className="sm:hidden">Viva</span>
            </button>

            {/* Documentation & Testing Guide */}
            <button
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
              title="Architecture and Manual Testing Checklist"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Docs</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
