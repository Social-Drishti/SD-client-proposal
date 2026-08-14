import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Proposal, PageType, ProposalPage } from './types';
import { initialProposalsList, socialDrishtiProposal } from './data/initialProposals';
import { ProposalPageCanvas } from './components/ProposalPageCanvas';
import { ProposalEditor } from './components/ProposalEditor';
import { SwipeablePages } from './components/SwipeablePages';
import { Navbar } from './components/Navbar';
import { ShareModal } from './components/ShareModal';
import { ExportProgressModal } from './components/ExportProgressModal';
import { exportProposalToPdf, ExportProgressDetail } from './lib/pdfGenerator';
import { CheckCircle2, FileText, ChevronLeft, ChevronRight, Download, Printer, Eye, Share2, Layout, LayoutPanelLeft, LayoutDashboard, Maximize2, Minimize2, Plus, Copy } from 'lucide-react';

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
  const [exportProgressDetail, setExportProgressDetail] = useState<ExportProgressDetail>({
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    status: 'idle'
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isExportProgressOpen, setIsExportProgressOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [splitView, setSplitView] = useState<boolean>(false);
  const [fabMenuOpen, setFabMenuOpen] = useState<boolean>(false);

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save
      if (modifier && e.key === 's') {
        e.preventDefault();
        handleSaveNow();
      }

      // Ctrl/Cmd + Shift + P: Toggle Preview Mode
      if (modifier && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setPreviewModeOnly(!previewModeOnly);
      }

      // Arrow Left/Right: Navigate pages (when not in preview mode and sidebar closed on mobile)
      if (!previewModeOnly && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!isMobile || !sidebarOpen) {
          e.preventDefault();
          const newIndex = e.key === 'ArrowLeft' 
            ? Math.max(0, activePageIndex - 1)
            : Math.min(activeProposal.pages.length - 1, activePageIndex + 1);
          setActivePageIndex(newIndex);
        }
      }

      // Escape: Close modals/sidebar
      if (e.key === 'Escape') {
        if (isShareModalOpen) setIsShareModalOpen(false);
        if (isExportProgressOpen) abortControllerRef.current?.abort();
        if (isMobile && sidebarOpen) setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageIndex, activeProposal.pages.length, handleSaveNow, isMobile, sidebarOpen, isShareModalOpen, isExportProgressOpen, previewModeOnly]);

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
        company: '',
        email: '',
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
            dateText: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
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

  // Add new page to current proposal
  const handleAddPage = (type: PageType) => {
    let newPage: ProposalPage = {
      id: `page-${Date.now()}`,
      pageTitle: 'New Section',
      type
    };

    if (type === 'cover') {
      const now = new Date();
      const dateText = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      newPage = {
        ...newPage,
        pageTitle: 'Cover Page',
        coverData: {
          mainTitle: 'Client Proposal Title',
          subtitle: 'Prepared Exclusively For',
          clientName: activeProposal.client.name,
          clientRole: activeProposal.client.role,
          dateText,
        }
      };
    } else if (type === 'category-table') {
      newPage = {
        ...newPage,
        pageTitle: 'Services & Scope',
        tableData: {
          categoryTitle: 'CATEGORY',
          detailsTitle: 'DETAILS',
          rows: [
            { id: 'r1', category: 'Deliverable 1', details: '• High impact specification 1\n• Specification 2' },
            { id: 'r2', category: 'Strategy', details: 'Comprehensive approach and monitoring' }
          ]
        }
      };
    } else if (type === 'pricing-highlight') {
      newPage = {
        ...newPage,
        pageTitle: 'Investment & Terms',
        pricingData: {
          highlightBoxTitle: 'Monthly – $5,000 + Taxes',
          highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
          notesHeader: 'Note',
          notes: [
            { id: 'n1', title: 'Payment Terms', description: 'Invoices issued monthly in advance.' }
          ]
        }
      };
    } else if (type === 'deliverables-grid') {
      newPage = {
        ...newPage,
        pageTitle: 'Core Features',
        deliverablesData: {
          sectionTitle: 'Core Features',
          items: [
            { id: 'd1', title: 'Feature 1', description: 'Feature details and deliverables.', badge: 'Included' },
            { id: 'd2', title: 'Feature 2', description: 'Feature details and deliverables.', badge: 'Premium' }
          ]
        }
      };
    } else if (type === 'terms-signature') {
      newPage = {
        ...newPage,
        pageTitle: 'Terms & Acceptance',
        termsData: {
          legalTerms: 'This proposal represents the entire agreement between parties.',
          paymentTerms: 'Payment due 15 days from invoice date.',
          validUntil: '30 Days',
          agencySignatoryName: activeProposal.agency.name,
          agencySignatoryTitle: 'Authorized Representative',
          clientSignatoryName: activeProposal.client.name,
          clientSignatoryTitle: activeProposal.client.role
        }
      };
    } else {
      newPage = {
        ...newPage,
        pageTitle: 'Executive Summary',
        freeformData: {
          heading: 'Executive Summary',
          content: 'Add your custom proposal narrative here.'
        }
      };
    }

    const updatedPages = [...activeProposal.pages, newPage];
    const updatedProposal = { ...activeProposal, pages: updatedPages, updatedAt: new Date().toISOString() };
    handleUpdateProposal(updatedProposal);
    setActivePageIndex(updatedPages.length - 1);
    showToast(`Added ${type} page`);
  };

  // Native Browser Print
  const handlePrintNative = useCallback(() => {
    window.print();
  }, []);

  // One-click PDF Download
  const handleDownloadPdf = useCallback(async () => {
    if (!pagesContainerRef.current) return;

    abortControllerRef.current = new AbortController();
    setIsExporting(true);
    setIsExportProgressOpen(true);
    setExportProgressDetail({
      progress: 0,
      currentPage: 0,
      totalPages: activeProposal.pages.length,
      status: 'rendering'
    });

    try {
      const filename = `${activeProposal.client.name.replace(/\s+/g, '_')}_Proposal.pdf`;
      await exportProposalToPdf(pagesContainerRef.current, filename, {
        onProgress: (detail) => {
          setExportProgressDetail(detail);
          setExportProgress(detail.progress);
        },
        signal: abortControllerRef.current.signal
      });
      showToast('PDF downloaded successfully!');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('Export cancelled');
      } else {
        console.error(err);
        showToast('Export failed. Try Print to PDF instead.');
      }
    } finally {
      setIsExporting(false);
      setTimeout(() => setIsExportProgressOpen(false), 1500);
    }
  }, [activeProposal]);

  const handleCancelExport = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsExportProgressOpen(false);
  }, []);

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
        onPrintNative={handlePrintNative}
        zoomLevel={zoomLevel}
        onChangeZoom={setZoomLevel}
        isExporting={isExporting}
        exportProgress={exportProgress}
        previewModeOnly={previewModeOnly}
        onTogglePreviewMode={() => setPreviewModeOnly(!previewModeOnly)}
        splitView={splitView}
        onToggleSplitView={() => setSplitView(!splitView)}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* Export Progress Modal */}
      <ExportProgressModal
        isOpen={isExportProgressOpen}
        onCancel={handleCancelExport}
        progress={exportProgressDetail.progress}
        currentPage={exportProgressDetail.currentPage}
        totalPages={exportProgressDetail.totalPages}
        status={exportProgressDetail.status}
        errorMessage={exportProgressDetail.errorMessage}
        estimatedTimeRemaining={exportProgressDetail.estimatedTimeRemaining}
        isMobile={isMobile}
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
        {isMobile && sidebarOpen && !previewModeOnly && !splitView && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* SPLIT VIEW MODE: Editor + Active Page Preview Side by Side */}
        {splitView && !previewModeOnly && (
          <div className="flex h-full w-full overflow-hidden">
            {/* Left: Editor Panel */}
            <div className="flex-1 min-w-0 h-full border-r border-slate-200 bg-white no-print">
              <ProposalEditor
                proposal={activeProposal}
                activePageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
                onUpdateProposal={handleUpdateProposal}
                isMobile={isMobile}
              />
            </div>

            {/* Right: Live Preview of Active Page Only */}
            <div className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F1F3F5] p-4 sm:p-8 flex flex-col items-center justify-start relative">
              {isMobile && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="no-print fixed bottom-6 right-6 z-30 p-4 bg-black text-white rounded-full shadow-xl flex items-center justify-center transition-all disabled:opacity-50 hover:bg-slate-800"
                  aria-label="Download proposal as PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <div
                ref={pagesContainerRef}
                className="print-area flex flex-col items-center w-full relative"
                style={{ transform: `scale(${isMobile ? Math.min(zoomLevel, 0.6) : zoomLevel})`, transformOrigin: 'top center' }}
              >
                {activeProposal.pages.map((page, idx) => (
                  <div
                    key={page.id}
                    id={`page-card-${idx}`}
                    className="relative flex flex-col items-center w-full"
                    style={idx !== activePageIndex
                      ? { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }
                      : undefined}
                  >
                    {idx === activePageIndex && (
                      <div className="no-print mb-2 flex items-center justify-between w-full max-w-[210mm] px-1 text-slate-500 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-700" />
                          Page {idx + 1} of {activeProposal.pages.length} — {page.pageTitle}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          Live Editing
                        </span>
                      </div>
                    )}

                    <div className="relative w-full max-w-[210mm]">
                      <ProposalPageCanvas
                        page={page}
                        agency={activeProposal.agency}
                        client={activeProposal.client}
                        theme={activeProposal.theme}
                        pageNumber={idx + 1}
                        totalPages={activeProposal.pages.length}
                        isSelected={idx === activePageIndex}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NORMAL MODE: Sidebar Editor + Full Preview Stack */}
        {!splitView && (
          <>
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
                    isMobile={isMobile}
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
                  isMobile={isMobile}
                />
              </div>
            )}
</>
        )}

        {/* Right Canvas Area: Live A4 Paginated Preview - Swipe Navigation */}
        <div className="flex-1 h-full bg-[#F1F3F5] p-4 sm:p-8 flex flex-col items-center justify-start relative">
          {/* Mobile: Toggle Sidebar Button */}
          {isMobile && !previewModeOnly && !splitView && (
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

          {/* Mobile: Action FAB */}
          {isMobile && !previewModeOnly && (
            <div className="no-print fixed bottom-6 right-6 z-30">
              {/* FAB Menu Items */}
              {fabMenuOpen && (
                <div className="absolute bottom-16 right-0 mb-2 flex flex-col-reverse items-end gap-2 animate-in slide-in-from-bottom-2 duration-200">
                  <button
                    type="button"
                    onClick={() => { handleCreateProposal(); setFabMenuOpen(false); }}
                    disabled={isExporting}
                    className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                    aria-label="New Proposal"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Proposal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleDuplicateProposal(); setFabMenuOpen(false); }}
                    disabled={isExporting}
                    className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                    aria-label="Duplicate Proposal"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleAddPage('category-table'); setFabMenuOpen(false); }}
                    disabled={isExporting}
                    className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                    aria-label="Add Section"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsShareModalOpen(true); setFabMenuOpen(false); }}
                    disabled={isExporting}
                    className="p-3 bg-emerald-50 text-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-emerald-100 border border-emerald-200 min-w-[160px] justify-end"
                    aria-label="Share Proposal"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleDownloadPdf(); setFabMenuOpen(false); }}
                    disabled={isExporting}
                    className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                    aria-label="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}

              {/* Main FAB */}
              <button
                type="button"
                onClick={() => setFabMenuOpen(!fabMenuOpen)}
                onContextMenu={(e) => { e.preventDefault(); setFabMenuOpen(!fabMenuOpen); }}
                disabled={isExporting}
                className={`p-4 bg-black text-white rounded-full shadow-xl flex items-center justify-center transition-all disabled:opacity-50 hover:bg-slate-800 ${fabMenuOpen ? 'rotate-45' : ''}`}
                aria-label={fabMenuOpen ? 'Close actions' : 'Open actions'}
                aria-expanded={fabMenuOpen}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Swipeable Pages Container for PDF Export */}
          <div
            ref={pagesContainerRef}
            className="print-area flex-1 w-full"
          >
            <SwipeablePages
              pages={activeProposal.pages}
              activePageIndex={activePageIndex}
              onPageChange={setActivePageIndex}
              agency={activeProposal.agency}
              client={activeProposal.client}
              theme={activeProposal.theme}
              isMobile={isMobile}
              zoomLevel={zoomLevel}
              showPageBadges={!previewModeOnly}
            />
          </div>
        </div>
      </>
    )}

        {/* PREVIEW ONLY MODE: Full width preview with swipe navigation */}
        {previewModeOnly && (
          <div className="flex-1 h-full bg-[#F1F3F5] p-4 sm:p-8 flex flex-col items-center justify-start">
            <div
              ref={pagesContainerRef}
              className="print-area flex-1 w-full"
            >
              <SwipeablePages
                pages={activeProposal.pages}
                activePageIndex={activePageIndex}
                onPageChange={setActivePageIndex}
                agency={activeProposal.agency}
                client={activeProposal.client}
                theme={activeProposal.theme}
                isMobile={isMobile}
                zoomLevel={zoomLevel}
                showPageBadges={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
