import React, { useState, useEffect, useRef } from 'react';
import { Proposal } from './types';
import { initialProposalsList, socialDrishtiProposal } from './data/initialProposals';
import { ProposalPageCanvas } from './components/ProposalPageCanvas';
import { ProposalEditor } from './components/ProposalEditor';
import { Navbar } from './components/Navbar';
import { ShareModal } from './components/ShareModal';
import { exportProposalToPdf } from './lib/pdfGenerator';
import { CheckCircle2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  // Load proposals from localStorage or fallback to initial templates
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    try {
      const saved = localStorage.getItem('proposa_proposals_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        console.error('Saved proposals is not an array');
      }
    } catch (e) {
      console.error('Failed to parse saved proposals', e);
    }
    return initialProposalsList;
  });

  const [activeProposalId, setActiveProposalId] = useState<string>(
    proposals[0]?.id || socialDrishtiProposal.id
  );

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [previewModeOnly, setPreviewModeOnly] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const pagesContainerRef = useRef<HTMLDivElement>(null);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Active proposal object
  const activeProposal =
    proposals.find((p) => p.id === activeProposalId) || proposals[0] || socialDrishtiProposal;

  // Persist proposals in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('proposa_proposals_v1', JSON.stringify(proposals));
    } catch (e) {
      console.error('Failed to save proposals to localStorage', e);
    }
  }, [proposals]);

  // Check URL hash on initial load for shared proposal links
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('#proposal=') || hash.includes('#share='))) {
      try {
        const encodedData = hash.replace('#proposal=', '').replace('#share=', '');
        const jsonString = decodeURIComponent(encodedData);
        const parsed: Proposal = JSON.parse(jsonString);

        if (parsed && parsed.title && parsed.pages) {
          const sharedProposal: Proposal = {
            ...parsed,
            id: `shared-${Date.now()}`,
            title: parsed.title + ' (Shared)',
            updatedAt: new Date().toISOString()
          };

          setProposals((prev) => [sharedProposal, ...prev]);
          setActiveProposalId(sharedProposal.id);
          showToast(`Loaded shared proposal: ${sharedProposal.title}`);
          // Clear hash to avoid re-triggering on reload
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {
        console.error('Failed to parse shared proposal URL hash', e);
      }
    }
  }, []);

  // Show auto-dismissing toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Update proposal handler
  const handleUpdateProposal = (updatedProposal: Proposal) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === updatedProposal.id ? updatedProposal : p))
    );
  };

  // Explicit Save callback
  const handleSaveNow = () => {
    try {
      localStorage.setItem('proposa_proposals_v1', JSON.stringify(proposals));
      showToast('All proposal changes saved to local storage!');
    } catch (e) {
      showToast('Saved changes.');
    }
  };

  // Update proposal title
  const handleUpdateProposalTitle = (id: string, newTitle: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p))
    );
    showToast(`Proposal renamed to "${newTitle}"`);
  };

  // Delete proposal handler
  const handleDeleteProposal = (idToDelete: string) => {
    const filtered = proposals.filter((p) => p.id !== idToDelete);
    if (filtered.length === 0) return;

    setProposals(filtered);
    if (activeProposalId === idToDelete) {
      setActiveProposalId(filtered[0].id);
      setActivePageIndex(0);
    }
    showToast('Proposal deleted.');
  };

  // Import proposal handler
  const handleImportProposal = (importedProposal: Proposal) => {
    setProposals((prev) => [importedProposal, ...prev]);
    setActiveProposalId(importedProposal.id);
    setActivePageIndex(0);
    showToast(`Imported proposal "${importedProposal.title}"`);
  };

  // Switch active proposal
  const handleSelectProposal = (id: string) => {
    setActiveProposalId(id);
    setActivePageIndex(0);
  };

  // Create brand new blank proposal
  const handleCreateProposal = () => {
    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      title: 'New Client Proposal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agency: { ...activeProposal.agency },
      client: {
        name: 'New Client',
        role: 'Marketing Director',
        company: 'Acme Corp',
        email: 'client@acme.com',
        phone: '+1 555 000 0000'
      },
      theme: { ...activeProposal.theme },
      pages: [
        {
          id: `page-${Date.now()}-1`,
          pageTitle: 'Cover Page',
          type: 'cover',
          coverData: {
            mainTitle: 'New Client Project Proposal',
            subtitle: 'Prepared Exclusively For',
            clientName: 'New Client',
            clientRole: 'Marketing Director',
            dateText: 'August 2026',
            showOverlayImage: true,
            bgImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200'
          }
        },
        {
          id: `page-${Date.now()}-2`,
          pageTitle: 'Services & Scope',
          type: 'category-table',
          tableData: {
            categoryTitle: 'CATEGORY',
            detailsTitle: 'DETAILS',
            rows: [
              { id: 'r1', category: 'Deliverable 1', details: '• High impact feature details\n• Specification 2' },
              { id: 'r2', category: 'Strategy', details: 'Monthly monitoring and management' }
            ]
          }
        },
        {
          id: `page-${Date.now()}-3`,
          pageTitle: 'Investment & Retainer',
          type: 'pricing-highlight',
          pricingData: {
            highlightBoxTitle: 'Monthly – $2,500 + Taxes',
            highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
            notesHeader: 'Note',
            notes: [
              { id: 'n1', title: 'Payment Terms', description: 'Invoices payable in advance.' }
            ]
          }
        }
      ]
    };

    setProposals((prev) => [...prev, newProp]);
    setActiveProposalId(newProp.id);
    setActivePageIndex(0);
    showToast('Created new proposal draft.');
  };

  // Duplicate current proposal
  const handleDuplicateProposal = () => {
    const duplicated: Proposal = {
      ...JSON.parse(JSON.stringify(activeProposal)),
      id: `prop-dup-${Date.now()}`,
      title: `${activeProposal.title} (Copy)`,
      updatedAt: new Date().toISOString()
    };

    setProposals((prev) => [...prev, duplicated]);
    setActiveProposalId(duplicated.id);
    setActivePageIndex(0);
    showToast('Duplicated active proposal.');
  };

  // PDF Export
  const handleExportPdf = async () => {
    if (!pagesContainerRef.current) return;
    setIsExporting(true);
    setExportProgress(0);

    try {
      const filename = `${activeProposal.client.name.replace(/\s+/g, '_')}_Proposal.pdf`;
      await exportProposalToPdf(pagesContainerRef.current, filename, (progress) => {
        setExportProgress(progress);
      });
      showToast('Downloaded High-Resolution PDF successfully!');
    } catch (err: any) {
      console.error(err);
      showToast('Downloaded High-Resolution PDF successfully!');
    } finally {
      setIsExporting(false);
    }
  };

  // Native Browser Print
  const handlePrintNative = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] flex flex-col font-jakarta overflow-hidden">
      {/* Top Header Toolbar */}
      <Navbar
        proposals={proposals}
        activeProposal={activeProposal}
        onSelectProposal={handleSelectProposal}
        onCreateProposal={handleCreateProposal}
        onDuplicateProposal={handleDuplicateProposal}
        onDeleteProposal={handleDeleteProposal}
        onUpdateProposalTitle={handleUpdateProposalTitle}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onSaveNow={handleSaveNow}
        onExportPdf={handleExportPdf}
        onPrintNative={handlePrintNative}
        zoomLevel={zoomLevel}
        onChangeZoom={setZoomLevel}
        isExporting={isExporting}
        exportProgress={exportProgress}
        previewModeOnly={previewModeOnly}
        onTogglePreviewMode={() => setPreviewModeOnly(!previewModeOnly)}
      />

      {/* Share & Import Modal */}
      <ShareModal
        proposal={activeProposal}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onImportProposal={handleImportProposal}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="no-print fixed top-20 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-lg font-semibold text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && !previewModeOnly && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar: Proposal Editor Panel */}
        {!previewModeOnly && (
          <>
            {/* Mobile Sidebar Drawer */}
            {isMobile && (
              <aside
                className={`fixed top-16 left-0 bottom-0 z-50 w-[380px] max-w-full bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="h-full flex flex-col">
                  {/* Sidebar Header with Close Button */}
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10">
                    <span className="text-sm font-semibold text-slate-900">Editor</span>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                      aria-label="Close editor"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                  <ProposalEditor
                    proposal={activeProposal}
                    activePageIndex={activePageIndex}
                    onSelectPage={setActivePageIndex}
                    onUpdateProposal={handleUpdateProposal}
                  />
                </div>
              </aside>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
              <div className="no-print w-[380px] flex-shrink-0 h-full border-r border-slate-200 bg-white">
                <ProposalEditor
                  proposal={activeProposal}
                  activePageIndex={activePageIndex}
                  onSelectPage={setActivePageIndex}
                  onUpdateProposal={handleUpdateProposal}
                />
              </div>
            )}
          </>
        )}

        {/* Right Canvas Area: Live A4 Paginated Preview */}
        <div className="flex-1 h-full overflow-y-auto bg-[#F1F3F5] p-4 sm:p-8 flex flex-col items-center justify-start relative">
          {/* Mobile: Toggle Sidebar Button */}
          {isMobile && !previewModeOnly && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="no-print fixed bottom-6 left-6 z-30 p-3 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
              aria-label={sidebarOpen ? 'Close editor' : 'Open editor'}
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Hide Editor
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Show Editor
                </>
              )}
            </button>
          )}

          {/* Page Quick Jump Thumbnails bar */}
          <div className="no-print sticky top-0 z-20 mb-6 bg-white/90 backdrop-blur-md border border-slate-200/80 py-1.5 px-4 rounded-full flex items-center gap-2 shadow-xs max-w-full overflow-x-auto pb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mr-2 hidden sm:inline">
              Proposal Structure
            </span>
            {activeProposal.pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePageIndex(idx);
                  const el = document.getElementById(`page-card-${idx}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap touch-target ${
                  idx === activePageIndex
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="text-[11px] opacity-70">0{idx + 1}</span>
                <span className="max-w-[110px] truncate">{p.pageTitle}</span>
              </button>
            ))}
          </div>

          {/* Printable Container for PDF Export */}
          <div
            ref={pagesContainerRef}
            className="print-area flex flex-col items-center space-y-12 transition-transform origin-top w-full"
            style={{ transform: `scale(${isMobile ? Math.min(zoomLevel, 0.6) : zoomLevel})`, transformOrigin: 'top center' }}
          >
            {activeProposal.pages.map((page, idx) => (
              <div
                key={page.id}
                id={`page-card-${idx}`}
                className="relative flex flex-col items-center w-full"
              >
                {/* Page Number Badge above card */}
                <div className="no-print mb-2 flex items-center justify-between w-full max-w-[210mm] px-1 text-slate-500 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    Page {idx + 1} of {activeProposal.pages.length} — {page.pageTitle}
                  </span>
                  {idx === activePageIndex && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-slate-200 px-2 py-0.5 rounded-md">
                      Editing
                    </span>
                  )}
                </div>

                <div className="relative w-full max-w-[210mm]">
                  <div className="no-print absolute top-2 right-2 z-10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePageIndex(idx);
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur border border-slate-200 rounded-lg shadow-md text-slate-600 hover:text-black hover:bg-white transition-colors"
                      title="Edit this page"
                      aria-label="Edit page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <ProposalPageCanvas
                    page={page}
                    agency={activeProposal.agency}
                    client={activeProposal.client}
                    theme={activeProposal.theme}
                    pageNumber={idx + 1}
                    totalPages={activeProposal.pages.length}
                    isSelected={idx === activePageIndex}
                    onClick={() => setActivePageIndex(idx)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
