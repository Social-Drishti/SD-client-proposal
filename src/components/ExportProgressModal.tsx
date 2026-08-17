import React, { useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

interface ExportProgressModalProps {
  isOpen: boolean;
  onCancel: () => void;
  progress: number;
  currentPage: number;
  totalPages: number;
  status: 'idle' | 'rendering' | 'generating' | 'downloading' | 'complete' | 'error';
  errorMessage?: string;
  estimatedTimeRemaining?: number;
  isMobile?: boolean;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  onCancel,
  progress,
  currentPage,
  totalPages,
  status,
  errorMessage,
  estimatedTimeRemaining,
  isMobile = false
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = React.useState(0);

  useEffect(() => {
    if (isOpen && (status === 'rendering' || status === 'generating')) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
    if (!isOpen) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);
    }
  }, [isOpen, status]);

  useEffect(() => {
    if (status === 'rendering' || status === 'generating') {
      startTimeRef.current = Date.now();
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'rendering':
        return { icon: Loader2, label: 'Rendering pages...', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'generating':
        return { icon: FileText, label: 'Generating PDF...', color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'downloading':
        return { icon: Loader2, label: 'Preparing download...', color: 'text-indigo-600', bg: 'bg-indigo-100' };
      case 'complete':
        return { icon: CheckCircle2, label: 'Export complete!', color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'error':
        return { icon: AlertCircle, label: 'Export failed', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Loader2, label: 'Starting...', color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 ${isMobile ? 'max-h-[90vh]' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${config.bg}`}>
              <StatusIcon className={`w-5 h-5 ${config.color} ${status === 'rendering' || status === 'generating' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Exporting PDF</h3>
              <p className="text-xs text-slate-500">{config.label}</p>
            </div>
          </div>
          {(status === 'rendering' || status === 'generating') && (
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              aria-label="Cancel export"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Content */}
        <div className="p-4 space-y-4">
          {/* Main Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{Math.round(progress)}%</span>
              <span className="text-slate-500">Page {currentPage} of {totalPages}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  status === 'error' ? 'bg-red-500' : status === 'complete' ? 'bg-emerald-500' : 'bg-black'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Time Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                <Clock className="w-3 h-3" />
                Elapsed
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">{formatTime(elapsedTime)}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                <Clock className="w-3 h-3" />
                Remaining
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {estimatedTimeRemaining ? formatTime(estimatedTimeRemaining) : '—'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                <FileText className="w-3 h-3" />
                Pages Done
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">{currentPage}/{totalPages}</div>
            </div>
          </div>

          {/* Current Page Indicator */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentPage - 1
                    ? 'bg-emerald-500'
                    : i === currentPage - 1
                    ? 'bg-black animate-pulse'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Actions */}
          {status === 'complete' && (
            <div className="pt-2 space-y-2">
              <button
                onClick={onCancel}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done
              </button>
            </div>
          )}
        </div>

        {/* Cancel Button for error state */}
        {status === 'error' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 sticky bottom-0 z-10">
            <button
              onClick={onCancel}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};