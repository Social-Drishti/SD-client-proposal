import React, { useState } from 'react';
import { Proposal } from '../types';
import {
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Link,
  X,
  FileJson,
  Sparkles,
  ExternalLink,
  FileText
} from 'lucide-react';

interface ShareModalProps {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
  onImportProposal: (importedProposal: Proposal) => void;
  onDownloadPdf?: () => void;
  isExporting?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onImportProposal,
  onDownloadPdf,
  isExporting = false
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'json' | 'import'>('link');

  if (!isOpen) return null;

  // Generate shareable link with encoded payload in URL hash
  const generateShareLink = () => {
    try {
      const jsonString = JSON.stringify(proposal);
      const encoded = encodeURIComponent(jsonString);
      return `${window.location.origin}${window.location.pathname}#proposal=${encoded}`;
    } catch (e) {
      console.error('Failed to generate share link', e);
      return window.location.href;
    }
  };

  const shareUrl = generateShareLink();

  // Copy shareable link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Web share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: proposal.title,
          text: `Proposal for ${proposal.client.name} by ${proposal.agency.name}`,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Copy raw JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  // Download JSON file
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(proposal, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const cleanClient = proposal.client.name.replace(/[^a-zA-Z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `${cleanClient}_proposal.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle JSON Import from text/file
  const handleImportSubmit = () => {
    setImportError(null);
    try {
      if (!importJsonInput.trim()) {
        setImportError('Please paste valid proposal JSON data.');
        return;
      }
      const parsed = JSON.parse(importJsonInput);
      if (!parsed.title || !parsed.pages || !Array.isArray(parsed.pages)) {
        setImportError('Invalid proposal structure. Missing title or pages array.');
        return;
      }

      // Assign new ID to avoid collision
      const imported: Proposal = {
        ...parsed,
        id: `imported-${Date.now()}`,
        title: parsed.title + ' (Imported)',
        updatedAt: new Date().toISOString()
      };

      onImportProposal(imported);
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1500);
    } catch (e: any) {
      setImportError('Failed to parse JSON: ' + e.message);
    }
  };

  // Handle File upload import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setImportJsonInput(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-white rounded-xl">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Share Proposal</h3>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {proposal.title} — {proposal.client.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('link')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-black text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            Share Link
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-black text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            Export / Data
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-black text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Proposal
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anyone with this link can view or duplicate this exact proposal configuration in their browser:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-black text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Share via Native Apps (WhatsApp, Email, AirDrop)
                </button>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-800 text-[11px]">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tip: Opening this link on another device loads the entire proposal instantly, complete with pages, pricing tables, and custom watermarks.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Download your proposal as a high-quality PDF or export the raw data:
              </p>

              {onDownloadPdf && (
                <button
                  onClick={() => { onDownloadPdf(); onClose(); }}
                  disabled={isExporting}
                  className="w-full p-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  {isExporting ? 'Exporting PDF...' : 'Download PDF'}
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadJson}
                  className="p-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download .JSON
                </button>

                <button
                  onClick={handleCopyJson}
                  className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Copied Data!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      Copy JSON
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Paste proposal JSON or upload a `.json` proposal file to add it to your saved proposals:
              </p>

              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors mb-2">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  Choose .json File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <textarea
                  rows={5}
                  value={importJsonInput}
                  onChange={(e) => setImportJsonInput(e.target.value)}
                  placeholder="Paste raw JSON here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:border-black focus:outline-none"
                />
              </div>

              {importError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  {importError}
                </p>
              )}

              {importSuccess && (
                <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Proposal imported successfully!
                </p>
              )}

              <button
                onClick={handleImportSubmit}
                className="w-full py-2.5 bg-black text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                Import Proposal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
