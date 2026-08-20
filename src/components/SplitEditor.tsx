import React from 'react';

interface SplitEditorProps {
  editedContent: string;
  onChange: (content: string) => void;
  heading: string;
  isMobile?: boolean;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  editedContent,
  onChange,
  heading,
}) => {
  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-slate-500 block">{heading}</label>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <textarea
          value={editedContent}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[500px] p-4 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-0 resize-none border-none"
          placeholder="Start editing..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};
