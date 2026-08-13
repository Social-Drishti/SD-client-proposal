import React, { useState } from 'react';
import { Proposal } from '../types';
import {
  Download,
  Printer,
  Plus,
  Copy,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Check,
  Eye,
  SlidersHorizontal,
  Share2,
  Trash2,
  Pencil,
  Save
} from 'lucide-react';

interface NavbarProps {
  proposals: Proposal[];
  activeProposal: Proposal;
  onSelectProposal: (proposalId: string) => void;
  onCreateProposal: () => void;
  onDuplicateProposal: () => void;
  onDeleteProposal: (proposalId: string) => void;
  onUpdateProposalTitle: (proposalId: string, title: string) => void;
  onOpenShareModal: () => void;
  onSaveNow: () => void;
  onExportPdf: () => void;
  onPrintNative: () => void;
  zoomLevel: number;
  onChangeZoom: (newZoom: number) => void;
  isExporting: boolean;
  exportProgress: number;
  previewModeOnly: boolean;
  onTogglePreviewMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  proposals,
  activeProposal,
  onSelectProposal,
  onCreateProposal,
  onDuplicateProposal,
  onDeleteProposal,
  onUpdateProposalTitle,
  onOpenShareModal,
  onSaveNow,
  onExportPdf,
  onPrintNative,
  zoomLevel,
  onChangeZoom,
  isExporting,
  exportProgress,
  previewModeOnly,
  onTogglePreviewMode
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const handleStartRename = (p: Proposal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(p.id);
    setTempTitle(p.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent | React.FocusEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onUpdateProposalTitle(id, tempTitle.trim());
    }
    setEditingTitleId(null);
  };

  const handleDelete = (p: Proposal, e: React.MouseEvent) => {
    e.stopPropagation();
    if (proposals.length <= 1) {
      alert('You must have at least one proposal.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
      onDeleteProposal(p.id);
    }
  };

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 select-none shrink-0">
      {/* Brand & Proposal Switcher */}
      <div className="flex items-center gap-4">
        {/* Brand Icon */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center rounded-lg shadow-xs">
            <span className="text-white font-bold text-xs uppercase">P</span>
          </div>
          <div className="hidden sm:block">
            {editingTitleId === activeProposal.id ? (
              <form onSubmit={(e) => handleSaveRename(activeProposal.id, e)} className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={(e) => handleSaveRename(activeProposal.id, e)}
                  className="text-xs font-bold text-slate-900 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-black"
                />
                <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <h1 className="text-sm font-medium tracking-tight text-slate-500 flex items-center gap-2">
                Draft / <span className="text-slate-900 font-semibold">{activeProposal.title}</span>
                <button
                  onClick={(e) => handleStartRename(activeProposal, e)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  title="Rename Proposal"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </h1>
            )}
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Proposal Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 transition-all max-w-[260px]"
          >
            <span className="truncate">{activeProposal.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">
                Saved Proposals ({proposals.length})
              </p>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {proposals.map((p) => {
                  const isEditingThis = editingTitleId === p.id;
                  const isActive = p.id === activeProposal.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!isEditingThis) {
                          onSelectProposal(p.id);
                          setDropdownOpen(false);
                        }
                      }}
                      className={`group w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {isEditingThis ? (
                        <form
                          onSubmit={(e) => handleSaveRename(p.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 w-full"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={(e) => handleSaveRename(p.id, e)}
                            className="flex-1 text-xs font-normal border border-slate-300 rounded px-2 py-0.5 text-slate-900 focus:outline-none focus:border-black"
                          />
                          <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-col truncate pr-2">
                            <span className="truncate text-slate-900">{p.title}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              Client: {p.client?.name || 'Unspecified'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(p, e)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-white rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Rename"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(p, e)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Proposal"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {isActive && <Check className="w-3.5 h-3.5 text-slate-900 ml-1" />}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onCreateProposal();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-700" />
                  New Proposal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDuplicateProposal();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Duplicate Active
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Controls: Canvas Zoom & View Mode */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => onChangeZoom(Math.max(0.4, zoomLevel - 0.1))}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-white transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-mono font-medium text-slate-700 px-2">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          type="button"
          onClick={() => onChangeZoom(Math.min(1.3, zoomLevel + 0.1))}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-white transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={onTogglePreviewMode}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
            previewModeOnly
              ? 'bg-black text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          {previewModeOnly ? (
            <>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Editor View
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Full Preview
            </>
          )}
        </button>
      </div>

      {/* Action Buttons: Save + Share + Print + Export PDF */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onSaveNow}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          title="Click to save active proposal state"
        >
          <Save className="w-3.5 h-3.5 text-slate-600" />
          <span>Save</span>
        </button>

        <button
          type="button"
          onClick={onOpenShareModal}
          className="px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-all"
          title="Share proposal via link, JSON, or import"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={onPrintNative}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-800 flex items-center gap-2 transition-all"
          title="Print to PDF via Browser"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          Print
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting}
          className="px-4 sm:px-5 py-2 text-xs font-semibold bg-black text-white rounded-lg hover:bg-slate-800 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? `Exporting (${exportProgress}%)...` : 'Export PDF'}
        </button>
      </div>
    </header>
  );
};

