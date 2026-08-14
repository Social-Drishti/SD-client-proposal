import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, Minimize2, PanelLeft, PanelRight, Columns, Rows } from 'lucide-react';

interface SplitEditorProps {
  originalContent: string;
  editedContent: string;
  onChange: (content: string) => void;
  heading: string;
  isMobile?: boolean;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  originalContent,
  editedContent,
  onChange,
  heading,
  isMobile = false,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'edited'>('split');
  const [syncScroll, setSyncScroll] = useState(true);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isScrolling = useRef(false);

  const handleLeftScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!syncScroll || isScrolling.current) return;
    isScrolling.current = true;
    if (rightRef.current) {
      rightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  }, [syncScroll]);

  const handleRightScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!syncScroll || isScrolling.current) return;
    isScrolling.current = true;
    if (leftRef.current) {
      leftRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  }, [syncScroll]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSyncToggle = () => {
    setSyncScroll(!syncScroll);
    if (!syncScroll && leftRef.current && rightTextareaRef.current) {
      rightTextareaRef.current.scrollTop = leftRef.current.scrollTop;
    }
  };

  const handleViewModeChange = (mode: 'split' | 'original' | 'edited') => {
    setViewMode(mode);
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-500">{heading}</label>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {(['original', 'edited', 'split'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleViewModeChange(mode)}
                className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-md transition-all ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode === 'original' && <PanelLeft className="w-3.5 h-3.5" />}
                {mode === 'edited' && <PanelRight className="w-3.5 h-3.5" />}
                {mode === 'split' && <Columns className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {viewMode !== 'edited' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PanelLeft className="w-3 h-3" />
                Original (Read-Only)
              </span>
              <span className="text-[10px] text-slate-400">{originalContent.split('\n').length} lines</span>
            </div>
            <div
              ref={leftRef}
              className="p-3 h-[300px] overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white"
              onScroll={handleLeftScroll}
            >
              {originalContent || 'No original content'}
            </div>
          </div>
        )}

        {viewMode !== 'original' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PanelRight className="w-3 h-3" />
                Editor
              </span>
              <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncScroll}
                  onChange={handleSyncToggle}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-black focus:ring-black"
                />
                <RefreshCw className="w-3 h-3" />
                Sync Scroll
              </label>
            </div>
            <textarea
              ref={rightTextareaRef}
              value={editedContent}
              onChange={handleTextareaChange}
              rows={15}
              className="w-full h-[300px] p-3 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-0 resize-none border-none"
              placeholder="Start editing..."
              spellCheck={false}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-500">{heading}</label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={handleSyncToggle}
              className="w-3.5 h-3.5 rounded border-slate-300 text-black focus:ring-black"
            />
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Scroll
          </label>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 ml-2">
            {(['split', 'original', 'edited'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleViewModeChange(mode)}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title={mode === 'split' ? 'Split View' : mode === 'original' ? 'Original Only' : 'Editor Only'}
              >
                {mode === 'split' && <Columns className="w-4 h-4" />}
                {mode === 'original' && <PanelLeft className="w-4 h-4" />}
                {mode === 'edited' && <PanelRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'split' && (
        <div className="grid grid-cols-2 gap-3 h-[500px]">
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PanelLeft className="w-3 h-3" />
                Original (Read-Only)
              </span>
              <span className="text-[10px] text-slate-400">{originalContent.split('\n').length} lines</span>
            </div>
            <div
              ref={leftRef}
              className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white"
              onScroll={handleLeftScroll}
            >
              {originalContent || 'No original content'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PanelRight className="w-3 h-3" />
                Editor
              </span>
              <span className="text-[10px] text-slate-400">{editedContent.split('\n').length} lines</span>
            </div>
            <textarea
              ref={rightTextareaRef}
              value={editedContent}
              onChange={handleTextareaChange}
              className="flex-1 p-3 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-0 resize-none border-none"
              placeholder="Start editing..."
              spellCheck={false}
              onScroll={handleRightScroll}
            />
          </div>
        </div>
      )}

      {viewMode === 'original' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <PanelLeft className="w-3 h-3" />
              Original (Read-Only)
            </span>
            <span className="text-[10px] text-slate-400">{originalContent.split('\n').length} lines</span>
          </div>
          <div
            ref={leftRef}
            className="p-4 h-[500px] overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white"
            onScroll={handleLeftScroll}
          >
            {originalContent || 'No original content'}
          </div>
        </div>
      )}

      {viewMode === 'edited' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <PanelRight className="w-3 h-3" />
              Editor
            </span>
            <span className="text-[10px] text-slate-400">{editedContent.split('\n').length} lines</span>
          </div>
          <textarea
            ref={rightTextareaRef}
            value={editedContent}
            onChange={handleTextareaChange}
            className="w-full h-[500px] p-4 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-0 resize-none border-none"
            placeholder="Start editing..."
            spellCheck={false}
            onScroll={handleRightScroll}
          />
        </div>
      )}
    </div>
  );
};