import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Proposal, PageType, ProposalPage } from './types';
import { ProposalProvider, useProposalContext } from './context/ProposalContext';
import { ViewProvider, useViewContext } from './context/ViewContext';
import { ProposalEditor } from './components/ProposalEditor';
import { SwipeablePages } from './components/SwipeablePages';
import { Navbar } from './components/Navbar';
import { ShareModal } from './components/ShareModal';
import { PrintLayout } from './components/PrintLayout';
import { CheckCircle2, FileText, ChevronLeft, ChevronRight, Printer, Share2, Plus, Copy } from 'lucide-react';

function AppContent() {
  const isPrintRoute = window.location.pathname.startsWith('/print/');

  if (isPrintRoute) {
    return <PrintLayout />;
  }

  const {
    state,
    activeProposal,
    createProposal: ctxCreateProposal,
    updateProposal: ctxUpdateProposal,
    deleteProposal: ctxDeleteProposal,
    selectProposal: ctxSelectProposal,
    setActivePageIndex: ctxSetActivePageIndex,
    addPage: ctxAddPage,
    undo,
    redo,
    canUndo,
    canRedo,
    importProposal: ctxImportProposal,
  } = useProposalContext();

  const {
    zoomLevel,
    previewModeOnly,
    sidebarOpen,
    isMobile,
    fabMenuOpen,
    setZoomLevel,
    togglePreviewMode,
    setSidebarOpen,
    setFabMenuOpen,
  } = useViewContext();

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState<boolean>(false);

  // Show auto-dismissing toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save (handled by Navbar, but we can keep for future use)
      if (modifier && e.key === 's') {
        e.preventDefault();
        // Save is now automatic, but we can show toast
        showToast('Changes saved automatically');
      }

      // Ctrl/Cmd + Shift + P: Toggle Preview Mode
      if (modifier && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        togglePreviewMode();
      }

      // Ctrl/Cmd + Z: Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if (modifier && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }

      // Arrow Left/Right: Navigate pages (when not in preview mode and sidebar closed on mobile)
      if (!previewModeOnly && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!isMobile || !sidebarOpen) {
          e.preventDefault();
          const newIndex = e.key === 'ArrowLeft'
            ? Math.max(0, state.activePageIndex - 1)
            : Math.min(activeProposal.pages.length - 1, state.activePageIndex + 1);
          ctxSetActivePageIndex(newIndex);
        }
      }

      // Escape: Close modals/sidebar
      if (e.key === 'Escape') {
        if (isShareModalOpen) setIsShareModalOpen(false);
        if (isMobile && sidebarOpen) setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.activePageIndex,
    activeProposal.pages.length,
    previewModeOnly,
    isMobile,
    sidebarOpen,
    isShareModalOpen,
    canUndo,
    canRedo,
    undo,
    redo,
    ctxSetActivePageIndex,
    togglePreviewMode,
    setSidebarOpen,
    showToast,
  ]);

  // Explicit Save callback (now mostly for toast feedback since autosave is automatic)
  const handleSaveNow = useCallback(() => {
    showToast('All proposal changes saved to local storage!');
  }, [showToast]);

  // Update proposal title
  const handleUpdateProposalTitle = useCallback((id: string, newTitle: string) => {
    ctxUpdateProposal({
      ...state.proposals.find((p) => p.id === id)!,
      title: newTitle,
      updatedAt: new Date().toISOString()
    });
    showToast(`Proposal renamed to "${newTitle}"`);
  }, [ctxUpdateProposal, state.proposals, showToast]);

  // Delete proposal handler
  const handleDeleteProposal = useCallback((idToDelete: string) => {
    const filtered = state.proposals.filter((p) => p.id !== idToDelete);
    if (filtered.length === 0) return;

    if (state.activeProposalId === idToDelete) {
      ctxSelectProposal(filtered[0].id);
    }
    ctxDeleteProposal(idToDelete);
    showToast('Proposal deleted.');
  }, [state.proposals, state.activeProposalId, ctxSelectProposal, ctxDeleteProposal, showToast]);

  // Import proposal handler
  const handleImportProposal = useCallback((importedProposal: Proposal) => {
    ctxImportProposal(importedProposal);
    showToast(`Imported proposal "${importedProposal.title}"`);
  }, [ctxImportProposal, showToast]);

  // Create brand new blank proposal
  const handleCreateProposal = useCallback(() => {
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
          data: {
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
          data: {
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
          data: {
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

    ctxCreateProposal(newProp);
    showToast('Created new proposal draft.');
  }, [activeProposal, ctxCreateProposal, showToast]);

  // Duplicate current proposal
  const handleDuplicateProposal = useCallback(() => {
    const duplicated: Proposal = {
      ...JSON.parse(JSON.stringify(activeProposal)),
      id: `prop-dup-${Date.now()}`,
      title: `${activeProposal.title} (Copy)`,
      updatedAt: new Date().toISOString()
    };

    ctxCreateProposal(duplicated);
    showToast('Duplicated active proposal.');
  }, [activeProposal, ctxCreateProposal, showToast]);

  // Add new page to current proposal
  const handleAddPage = useCallback((type: PageType) => {
    let newPage: ProposalPage;

    if (type === 'cover') {
      const now = new Date();
      const dateText = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Cover Page',
        type: 'cover',
        data: {
          mainTitle: 'Client Proposal Title',
          subtitle: 'Prepared Exclusively For',
          clientName: activeProposal.client.name,
          clientRole: activeProposal.client.role,
          dateText,
        }
      };
    } else if (type === 'category-table') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Services & Scope',
        type: 'category-table',
        data: {
          categoryTitle: 'CATEGORY',
          detailsTitle: 'DETAILS',
          rows: [
            { id: 'r1', category: 'Deliverable 1', details: '• High impact specification 1\n• Specification 2' },
            { id: 'r2', category: 'Strategy', details: 'Comprehensive approach and monitoring' }
          ]
        }
      };
    } else if (type === 'smm-scope') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Social Media Management (Scope)',
        type: 'smm-scope',
        data: {
          categoryTitle: 'CATEGORY',
          detailsTitle: 'DETAILS',
          rows: [
            {
              id: `r1`,
              category: 'Platforms',
              details: 'Instagram, Facebook, Linkedin, Youtube',
            },
            {
              id: `r2`,
              category: 'Posts',
              details: [
                '25 posts per month (Instagram, Facebook)',
                '10 posts per month (Linkedin)',
                '15 Story per month',
                '18 Reels, Remaining Static/Carousel',
                'Grid planning',
                'Aesthetic looks, Moodboard',
              ],
            },
            {
              id: `r3`,
              category: 'Strategy',
              details: [
                'Hashtag research and social media strategy',
                'Content and brand positioning planning',
                'Monthly social media strategy',
                'Posting and scheduling',
                'ORM (Online Reputation Management)',
              ],
            },
            {
              id: `r4`,
              category: 'Optimization',
              details: 'Page optimization & periodic suggestions based on research',
            },
            {
              id: `r5`,
              category: 'Content',
              details: [
                'Monthly content calendar planning',
                'Copywriting and caption writing',
              ],
            },
            {
              id: `r6`,
              category: 'Designing',
              details: 'Making visual creatives based on brand tonality (2 revisions per post on static creatives)',
            },
          ],
        }
      };
    } else if (type === 'smm-operations') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Social Media Management (Operations)',
        type: 'smm-operations',
        data: {
          categoryTitle: 'CATEGORY',
          detailsTitle: 'DETAILS',
          rows: [
            {
              id: `r7`,
              category: 'Scheduling & Publishing',
              details: 'Optimal time posting on decided platforms',
            },
            {
              id: `r8`,
              category: 'Engagement',
              details: 'Image/location tagging',
            },
            {
              id: `r9`,
              category: 'Monitoring',
              details: 'Community management (comment and DM monitoring)',
            },
            {
              id: `r10`,
              category: 'Reporting',
              details: 'Monthly performance report and insights',
            },
            {
              id: `r11`,
              category: 'Complimentary',
              details: 'Festive stories',
            },
          ],
        }
      };
    } else if (type === 'video-production') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Video Production',
        type: 'video-production',
        data: {
          categoryTitle: 'CATEGORY',
          detailsTitle: 'DETAILS',
          rows: [
            {
              id: `v1`,
              category: 'Video shoot',
              details: [
                '3 video shoot monthly',
                '2 Podcasts / 1 on-site shoot',
                'Professional camera setup',
                'Lighting setup',
                'Videographer | Photographer + 1 assistant',
                'Complete shoot coordination',
                'Topic suggestions will be provided by our team',
              ],
            },
            {
              id: `v2`,
              category: 'Duration of videos',
              details: '30 secs – 90 secs',
            },
            {
              id: `v3`,
              category: 'Editing',
              details: 'Editing, colour grade, text overlays and background music',
            },
            {
              id: `v4`,
              category: 'Strategy',
              details: 'Shoot planning & shot list preparation before each session',
            },
            {
              id: `v5`,
              category: 'Video Concept',
              details: 'The video concept will be planned by our team.',
            },
            {
              id: `v6`,
              category: 'Shot list & prop checklist',
              details: 'Prop requirement checklist will be shared in advance, client need to arrange',
            },
            {
              id: `v7`,
              category: 'Video Reference',
              details: 'Reference Videos per concept will be shared by us for client alignment before shoot',
            },
          ],
        }
      };
    } else if (type === 'pricing-highlight') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Investment & Terms',
        type: 'pricing-highlight',
        data: {
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
        id: `page-${Date.now()}`,
        pageTitle: 'Core Features',
        type: 'deliverables-grid',
        data: {
          sectionTitle: 'Core Features',
          items: [
            { id: 'd1', title: 'Feature 1', description: 'Feature details and deliverables.', badge: 'Included' },
            { id: 'd2', title: 'Feature 2', description: 'Feature details and deliverables.', badge: 'Premium' }
          ]
        }
      };
    } else if (type === 'terms-signature') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Terms & Acceptance',
        type: 'terms-signature',
        data: {
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
        id: `page-${Date.now()}`,
        pageTitle: 'Executive Summary',
        type: 'freeform',
        data: {
          heading: 'Executive Summary',
          content: 'Add your custom proposal narrative here.'
        }
      };
    }

    ctxAddPage(activeProposal.id, newPage);
    showToast(`Added ${type} page`);
  }, [activeProposal, ctxAddPage, showToast]);

  // Native Browser Print - Opens PrintLayout in a popup so ALL pages are printed
  const handlePrintNative = useCallback(() => {
    sessionStorage.setItem('print-proposal-data', JSON.stringify(activeProposal));

    const printUrl = `${window.location.origin}/print/native`;
    const popup = window.open(printUrl, '_blank', 'width=900,height=1200,scrollbars=yes');

    if (!popup) {
      showToast('Pop-up blocked — please allow pop-ups and try again');
      return;
    }

    // Extended timeout for complex proposals
    const printTimeout = setTimeout(() => {
      try {
        popup.print();
      } catch (e) {
        console.error('Print failed (timeout):', e);
        showToast('Print timed out. Please try again.');
      }
    }, 30000); // 30 seconds for large proposals

    let checkReadyInterval: ReturnType<typeof setInterval> | null = null;
    let hasPrinted = false;

    const triggerPrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      if (checkReadyInterval) clearInterval(checkReadyInterval);
      clearTimeout(printTimeout);
      setTimeout(() => {
        try {
          popup.print();
        } catch (e) {
          console.error('Print failed:', e);
          showToast('Print failed. Please try again.');
        }
      }, 500);
    };

    popup.addEventListener('load', () => {
      checkReadyInterval = setInterval(() => {
        try {
          if (popup.document.querySelector('[data-print-ready="true"]')) {
            triggerPrint();
          }
        } catch (e) {
          // Cross-origin or popup closed
          clearInterval(checkReadyInterval!);
          clearTimeout(printTimeout);
        }
      }, 200);

      // Fallback timeout - if ready never fires, try print anyway
      setTimeout(() => {
        if (!hasPrinted) {
          clearInterval(checkReadyInterval!);
          clearTimeout(printTimeout);
          triggerPrint();
        }
      }, 30000); // Match the main timeout
    });

    // Handle popup closed before print
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        clearInterval(checkReadyInterval!);
        clearTimeout(printTimeout);
        if (!hasPrinted) {
          sessionStorage.removeItem('print-proposal-data');
        }
      }
    }, 500);
  }, [activeProposal, showToast]);

  // Cover page date handler
  const activePage = activeProposal.pages[state.activePageIndex];
  const isCoverPage = activePage?.type === 'cover';

  const handleUpdateCoverDate = useCallback((date: string) => {
    if (!activePage || activePage.type !== 'cover') return;
    const updatedPage = { ...activePage, data: { ...activePage.data, dateText: date } };
    const updatedPages = [...activeProposal.pages];
    updatedPages[state.activePageIndex] = updatedPage;
    ctxUpdateProposal({
      ...activeProposal,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    });
  }, [activePage, activeProposal, state.activePageIndex, ctxUpdateProposal]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] flex flex-col font-jakarta overflow-hidden">
      {/* Top Header Toolbar */}
      <Navbar
        activeProposal={activeProposal}
        onSelectProposal={ctxSelectProposal}
        onCreateProposal={handleCreateProposal}
        onDuplicateProposal={handleDuplicateProposal}
        onDeleteProposal={handleDeleteProposal}
        onUpdateProposalTitle={handleUpdateProposalTitle}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onSaveNow={handleSaveNow}
        onPrintNative={handlePrintNative}
        zoomLevel={zoomLevel}
        onChangeZoom={setZoomLevel}
        previewModeOnly={previewModeOnly}
        onTogglePreviewMode={togglePreviewMode}
        activePageType={activePage?.type || ''}
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
            className="no-print fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* NORMAL MODE: Sidebar Editor + Full Preview Stack */}
        <>
          {/* Left Sidebar: Proposal Editor Panel */}
            {!previewModeOnly && (
              <>
                {/* Mobile Sidebar Drawer */}
                {isMobile && (
              <aside
                className={`no-print fixed top-16 left-0 bottom-0 z-50 w-[380px] max-w-full bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
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
                    activePageIndex={state.activePageIndex}
                    onSelectPage={ctxSetActivePageIndex}
                    onUpdateProposal={ctxUpdateProposal}
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
                      activePageIndex={state.activePageIndex}
                      onSelectPage={ctxSetActivePageIndex}
                      onUpdateProposal={ctxUpdateProposal}
                      isMobile={isMobile}
                    />
                  </div>
                )}
              </>
            )}

            {/* Right Canvas Area: Live A4 Paginated Preview - Swipe Navigation */}
            <div className="flex-1 h-full bg-[#F1F3F5] p-4 sm:p-8 flex flex-col items-center justify-start relative">
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

              {/* Mobile: Action FAB */}
              {isMobile && !previewModeOnly && (
                <div className="no-print fixed bottom-6 right-6 z-30">
                  {/* FAB Menu Items */}
                  {fabMenuOpen && (
                    <div className="absolute bottom-16 right-0 mb-2 flex flex-col-reverse items-end gap-2 animate-in slide-in-from-bottom-2 duration-200">
                      <button
                        type="button"
                        onClick={() => { handleCreateProposal(); setFabMenuOpen(false); }}
                        className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                        aria-label="New Proposal"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Proposal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleDuplicateProposal(); setFabMenuOpen(false); }}
                        className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                        aria-label="Duplicate Proposal"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleAddPage('category-table'); setFabMenuOpen(false); }}
                        className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                        aria-label="Add Section"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Add Section</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsShareModalOpen(true); setFabMenuOpen(false); }}
                        className="p-3 bg-emerald-50 text-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-emerald-100 border border-emerald-200 min-w-[160px] justify-end"
                        aria-label="Share Proposal"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { handlePrintNative(); setFabMenuOpen(false); }}
                        className="p-3 bg-white text-slate-900 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:bg-slate-50 min-w-[160px] justify-end"
                        aria-label="Print Proposal"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  )}

                  {/* Main FAB */}
                  <button
                    type="button"
                    onClick={() => setFabMenuOpen(!fabMenuOpen)}
                    onContextMenu={(e) => { e.preventDefault(); setFabMenuOpen(!fabMenuOpen); }}
                    className={`p-4 bg-black text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:bg-slate-800 ${fabMenuOpen ? 'rotate-45' : ''}`}
                    aria-label={fabMenuOpen ? 'Close actions' : 'Open actions'}
                    aria-expanded={fabMenuOpen}
                  >
                    <Printer className="w-5 h-5" />
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
                  activePageIndex={state.activePageIndex}
                  onPageChange={ctxSetActivePageIndex}
                  agency={activeProposal.agency}
                  client={activeProposal.client}
                  theme={activeProposal.theme}
                  isMobile={isMobile}
                  zoomLevel={zoomLevel}
                  showPageBadges={!previewModeOnly}
                  onUpdateCoverDate={handleUpdateCoverDate}
                />
              </div>
            </div>
          </>

        {/* PREVIEW ONLY MODE: Full width preview with swipe navigation */}
        {previewModeOnly && (
          <div className="flex-1 h-full bg-[#F1F3F5] p-4 sm:p-8 flex flex-col items-center justify-start">
            <div
              ref={pagesContainerRef}
              className="print-area flex-1 w-full"
            >
              <SwipeablePages
                pages={activeProposal.pages}
                activePageIndex={state.activePageIndex}
                onPageChange={ctxSetActivePageIndex}
                agency={activeProposal.agency}
                client={activeProposal.client}
                theme={activeProposal.theme}
                isMobile={isMobile}
                zoomLevel={zoomLevel}
                showPageBadges={false}
                onUpdateCoverDate={handleUpdateCoverDate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ProposalProvider>
      <ViewProvider>
        <AppContent />
      </ViewProvider>
    </ProposalProvider>
  );
}

export default App;