import React, { useState } from 'react';
import { Proposal, ProposalPage, PageType, CategoryTableRow, PricingNote, DeliverableItem } from '../types';
import { ThemeSelector } from './ThemeSelector';
import { getPageRegistryEntries } from '../data/pageRegistry';
import {
  Layers,
  FileText,
  UserCheck,
  Palette,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Upload,
  GripVertical,
} from 'lucide-react';

interface ProposalEditorProps {
  proposal: Proposal;
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onUpdateProposal: (updated: Proposal) => void;
  isMobile?: boolean;
}

export const ProposalEditor: React.FC<ProposalEditorProps> = ({
  proposal,
  activePageIndex,
  onSelectPage,
  onUpdateProposal,
  isMobile = false
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'pages' | 'branding' | 'design'>('content');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const activePage: ProposalPage | undefined = proposal.pages[activePageIndex] || proposal.pages[0];

  // Helper to update active page
  const updateActivePage = (updatedPage: ProposalPage) => {
    const updatedPages = [...proposal.pages];
    updatedPages[activePageIndex] = updatedPage;
    onUpdateProposal({
      ...proposal,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    });
  };

  // Helper to add new page
  const handleAddPage = (type: PageType) => {
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
          clientName: proposal.client.name,
          clientRole: proposal.client.role,
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
            { id: 'r1', category: 'Deliverable 1', details: 'â€¢ High impact specification 1\nâ€¢ Specification 2' },
            { id: 'r2', category: 'Strategy', details: 'Comprehensive approach and monitoring' }
          ]
        }
      };
    } else if (type === 'pricing-highlight') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Investment & Terms',
        type: 'pricing-highlight',
        data: {
          highlightBoxTitle: 'Monthly â€“ â‚¹4,999 + 18% GST',
          highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
          notesHeader: 'Note',
          notes: [
            { id: 'n1', title: 'Payment Terms', description: 'One service per month.' }
          ]
        }
      };
    } else if (type === 'combined-table-pricing') {
      newPage = {
        id: `page-${Date.now()}`,
        pageTitle: 'Scope & Investment',
        type: 'combined-table-pricing',
data: {
          table: {
            categoryTitle: 'CATEGORY',
            detailsTitle: 'DETAILS',
            rows: [
              { id: 'r1', category: 'New Category', details: 'â€¢ Item description\nâ€¢ Details line 2' },
              { id: 'r2', category: 'Strategy', details: 'Comprehensive approach and monitoring' }
            ]
          },
          pricing: {
            highlightBoxTitle: 'Monthly â€“ â‚¹4,999 + 18% GST',
            highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
            notesHeader: 'Note',
            notes: [
              { id: 'n1', title: 'Payment Terms', description: 'One service per month.' }
            ]
          }
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
          agencySignatoryName: proposal.agency.name,
          agencySignatoryTitle: 'Authorized Representative',
          clientSignatoryName: proposal.client.name,
          clientSignatoryTitle: proposal.client.role
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

    const updatedPages = [...proposal.pages, newPage];
    onUpdateProposal({ ...proposal, pages: updatedPages });
    onSelectPage(updatedPages.length - 1);
  };

  // Reorder pages
  const movePage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === proposal.pages.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedPages = [...proposal.pages];
    const temp = updatedPages[index];
    updatedPages[index] = updatedPages[targetIndex];
    updatedPages[targetIndex] = temp;

    onUpdateProposal({ ...proposal, pages: updatedPages });
    onSelectPage(targetIndex);
  };

  const duplicatePage = (index: number) => {
    const pageToDup = proposal.pages[index];
    const newPage: ProposalPage = {
      ...JSON.parse(JSON.stringify(pageToDup)),
      id: `page-${Date.now()}`,
      pageTitle: `${pageToDup.pageTitle} (Copy)`
    };

    const updatedPages = [...proposal.pages];
    updatedPages.splice(index + 1, 0, newPage);
    onUpdateProposal({ ...proposal, pages: updatedPages });
    onSelectPage(index + 1);
  };

  const deletePage = (index: number) => {
    if (proposal.pages.length <= 1) return;
    const updatedPages = proposal.pages.filter((_, idx) => idx !== index);
    onUpdateProposal({ ...proposal, pages: updatedPages });
    onSelectPage(Math.max(0, index - 1));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedPages = [...proposal.pages];
    const [draggedPage] = updatedPages.splice(draggedIndex, 1);
    updatedPages.splice(targetIndex, 0, draggedPage);

    onUpdateProposal({ ...proposal, pages: updatedPages });
    
    let newActiveIndex = activePageIndex;
    if (activePageIndex === draggedIndex) {
      newActiveIndex = targetIndex;
    } else if (
      (draggedIndex < activePageIndex && targetIndex >= activePageIndex) ||
      (draggedIndex > activePageIndex && targetIndex <= activePageIndex)
    ) {
      newActiveIndex = draggedIndex < targetIndex ? activePageIndex - 1 : activePageIndex + 1;
    }
    onSelectPage(newActiveIndex);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-slate-200 text-slate-900">
      {/* Top Tab Bar */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/80 p-1 gap-1 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap min-w-[80px] ${
            activeTab === 'content'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap min-w-[80px] ${
            activeTab === 'pages'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Structure</span>
          <span className="text-[10px] bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5">{proposal.pages.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap min-w-[80px] ${
            activeTab === 'branding'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap min-w-[80px] ${
            activeTab === 'design'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: CONTENT EDITOR */}
        {activeTab === 'content' && activePage && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Active Page {activePageIndex + 1}
                </span>
                <input
                  type="text"
                  value={activePage.pageTitle}
                  onChange={(e) =>
                    updateActivePage({ ...activePage, pageTitle: e.target.value })
                  }
                  className="block w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none focus:border-b border-black"
                />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 uppercase tracking-wider">
                {activePage.type}
              </span>
            </div>

{/* COVER PAGE FORM */}
            {activePage.type === 'cover' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Main Proposal Title
                  </label>
                  <textarea
                    rows={2}
                    value={activePage.data?.mainTitle || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          ...activePage.data!,
                          mainTitle: e.target.value
                        }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.clientName || ''}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            clientName: e.target.value
                          }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Client Role / Designation
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.clientRole || ''}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            clientRole: e.target.value
                          }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={activePage.data?.dateText || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          ...activePage.data!,
                          dateText: e.target.value
                        }
                      })
                    }
                    placeholder="e.g. August 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Footer Number
                  </label>
                  <input
                    type="text"
                    value={activePage.footerNumber || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        footerNumber: e.target.value
                      })
                    }
                    placeholder="PROP-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY TABLE FORM */}
            {activePage.type === 'category-table' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Left Column Title
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.categoryTitle || 'CATEGORY'}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            categoryTitle: e.target.value
                          }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Right Column Title
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.detailsTitle || 'DETAILS'}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            detailsTitle: e.target.value
                          }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rows Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Table Rows ({activePage.data?.rows.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentRows = activePage.data?.rows || [];
                        const newRow: CategoryTableRow = {
                          id: `r-${Date.now()}`,
                          category: 'New Category',
                          details: 'â€¢ Item description\nâ€¢ Details line 2'
                        };
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            rows: [...currentRows, newRow]
                          }
                        });
                      }}
                      className="py-1 px-2.5 bg-black hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activePage.data?.rows.map((row, rIdx) => (
                      <div
                        key={row.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={row.category}
                            onChange={(e) => {
                              const updatedRows = [...activePage.data!.rows];
                              updatedRows[rIdx].category = e.target.value;
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, rows: updatedRows }
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-bold text-slate-900 flex-1 focus:outline-none focus:border-black"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const updatedRows = activePage.data!.rows.filter(
                                (_, idx) => idx !== rIdx
                              );
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, rows: updatedRows }
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Details (Use bullet points starting with â€¢ or newlines)"
                          value={row.details}
                          onChange={(e) => {
                            const updatedRows = [...activePage.data!.rows];
                            updatedRows[rIdx].details = e.target.value;
                            updateActivePage({
                              ...activePage,
                              data: { ...activePage.data!, rows: updatedRows }
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-black"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Footer Number
                  </label>
                  <input
                    type="text"
                    value={activePage.footerNumber || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        footerNumber: e.target.value
                      })
                    }
                    placeholder="PROP-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PRICING HIGHLIGHT FORM */}
            {activePage.type === 'pricing-highlight' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Highlighted Commercial Box Title
                  </label>
                  <input
                    type="text"
                    value={activePage.data?.highlightBoxTitle || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          ...activePage.data!,
                          highlightBoxTitle: e.target.value
                        }
                      })
                    }
                    placeholder="Monthly ₹2,500 + Taxes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Highlight Box Subtitle
                  </label>
                  <input
                    type="text"
                    value={activePage.data?.highlightBoxSubtitle || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          ...activePage.data!,
                          highlightBoxSubtitle: e.target.value
                        }
                      })
                    }
                    placeholder="(Minimum Lock-in Period 6 Months)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                {/* Notes List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Proposal Notes & Terms ({activePage.data?.notes.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentNotes = activePage.data?.notes || [];
                        const newNote: PricingNote = {
                          id: `n-${Date.now()}`,
                          title: 'Extra Service',
                          description: 'Scope conditions and approval terms.'
                        };
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            notes: [...currentNotes, newNote]
                          }
                        });
                      }}
                      className="py-1 px-2.5 bg-black hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Note
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activePage.data?.notes.map((note, nIdx) => (
                      <div
                        key={note.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={note.title}
                            onChange={(e) => {
                              const updatedNotes = [...activePage.data!.notes];
                              updatedNotes[nIdx].title = e.target.value;
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, notes: updatedNotes }
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 flex-1 focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedNotes = activePage.data!.notes.filter(
                                (_, idx) => idx !== nIdx
                              );
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, notes: updatedNotes }
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={note.description}
                          onChange={(e) => {
                            const updatedNotes = [...activePage.data!.notes];
                            updatedNotes[nIdx].description = e.target.value;
                            updateActivePage({
                              ...activePage,
                              data: { ...activePage.data!, notes: updatedNotes }
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-black"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Footer Number
                  </label>
                  <input
                    type="text"
                    value={activePage.footerNumber || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        footerNumber: e.target.value
                      })
                    }
                    placeholder="PROP-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* COMBINED TABLE + PRICING FORM */}
            {activePage.type === 'combined-table-pricing' && (
              <div className="space-y-4">
                {/* --- TABLE SECTION --- */}
                <div>
                  <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Table Settings</h5>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Left Column Title
                    </label>
                    <input
                      type="text"
                      value={(activePage.data as any)?.table?.categoryTitle || 'CATEGORY'}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            table: { ...(activePage.data as any).table, categoryTitle: e.target.value }
                          }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Right Column Title
                    </label>
                    <input
                      type="text"
                      value={(activePage.data as any)?.table?.detailsTitle || 'DETAILS'}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            table: { ...(activePage.data as any).table, detailsTitle: e.target.value }
                          }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Table Rows Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Table Rows ({(activePage.data as any)?.table?.rows?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const table = (activePage.data as any).table;
                        const currentRows = table?.rows || [];
                        const newRow: CategoryTableRow = {
                          id: `r-${Date.now()}`,
                          category: 'New Category',
                          details: 'â€¢ Item description\nâ€¢ Details line 2'
                        };
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            table: { ...table, rows: [...currentRows, newRow] }
                          }
                        });
                      }}
                      className="py-1 px-2.5 bg-black hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(activePage.data as any)?.table?.rows?.map((row: CategoryTableRow, rIdx: number) => (
                      <div
                        key={row.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={row.category}
                            onChange={(e) => {
                              const table = (activePage.data as any).table;
                              const updatedRows = [...table.rows];
                              updatedRows[rIdx] = { ...updatedRows[rIdx], category: e.target.value };
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, table: { ...table, rows: updatedRows } }
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-bold text-slate-900 flex-1 focus:outline-none focus:border-black"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const table = (activePage.data as any).table;
                              const updatedRows = table.rows.filter(
                                (_: any, idx: number) => idx !== rIdx
                              );
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, table: { ...table, rows: updatedRows } }
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Details (Use bullet points starting with â€¢ or newlines)"
                          value={row.details}
                          onChange={(e) => {
                            const table = (activePage.data as any).table;
                            const updatedRows = [...table.rows];
                            updatedRows[rIdx] = { ...updatedRows[rIdx], details: e.target.value };
                            updateActivePage({
                              ...activePage,
                              data: { ...activePage.data!, table: { ...table, rows: updatedRows } }
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-black"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- DIVIDER --- */}
                <div className="border-t border-slate-200 pt-4 mt-4" />

                {/* --- PRICING SECTION --- */}
                <div>
                  <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Pricing Settings</h5>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Highlighted Commercial Box Title
                  </label>
                  <input
                    type="text"
                    value={(activePage.data as any)?.pricing?.highlightBoxTitle || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          ...activePage.data!,
                          pricing: { ...(activePage.data as any).pricing, highlightBoxTitle: e.target.value }
                        }
                      })
                    }
                    placeholder="Monthly ₹2,500 + Taxes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Highlight Box Subtitle
                  </label>
                  <input
                    type="text"
                    value={(activePage.data as any)?.pricing?.highlightBoxSubtitle || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          ...activePage.data!,
                          pricing: { ...(activePage.data as any).pricing, highlightBoxSubtitle: e.target.value }
                        }
                      })
                    }
                    placeholder="(Minimum Lock-in Period 6 Months)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                {/* Pricing Notes Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Proposal Notes & Terms ({(activePage.data as any)?.pricing?.notes?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const pricing = (activePage.data as any).pricing;
                        const currentNotes = pricing?.notes || [];
                        const newNote: PricingNote = {
                          id: `n-${Date.now()}`,
                          title: 'Extra Service',
                          description: 'Scope conditions and approval terms.'
                        };
                        updateActivePage({
                          ...activePage,
                          data: {
                            ...activePage.data!,
                            pricing: { ...pricing, notes: [...currentNotes, newNote] }
                          }
                        });
                      }}
                      className="py-1 px-2.5 bg-black hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Note
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(activePage.data as any)?.pricing?.notes?.map((note: PricingNote, nIdx: number) => (
                      <div
                        key={note.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={note.title}
                            onChange={(e) => {
                              const pricing = (activePage.data as any).pricing;
                              const updatedNotes = [...pricing.notes];
                              updatedNotes[nIdx] = { ...updatedNotes[nIdx], title: e.target.value };
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, pricing: { ...pricing, notes: updatedNotes } }
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 flex-1 focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const pricing = (activePage.data as any).pricing;
                              const updatedNotes = pricing.notes.filter(
                                (_: any, idx: number) => idx !== nIdx
                              );
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, pricing: { ...pricing, notes: updatedNotes } }
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={note.description}
                          onChange={(e) => {
                            const pricing = (activePage.data as any).pricing;
                            const updatedNotes = [...pricing.notes];
                            updatedNotes[nIdx] = { ...updatedNotes[nIdx], description: e.target.value };
                            updateActivePage({
                              ...activePage,
                              data: { ...activePage.data!, pricing: { ...pricing, notes: updatedNotes } }
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-black"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TERMS & ACCEPTANCE FORM */}
            {activePage.type === 'terms-signature' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    General Scope & Services Agreement
                  </label>
                  <textarea
                    rows={4}
                    value={activePage.data?.legalTerms || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: { ...activePage.data!, legalTerms: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Commercial Terms & Payment Schedule
                  </label>
                  <textarea
                    rows={4}
                    value={activePage.data?.paymentTerms || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: { ...activePage.data!, paymentTerms: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Valid Until
                  </label>
                  <input
                    type="text"
                    value={activePage.data?.validUntil || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        data: { ...activePage.data!, validUntil: e.target.value }
                      })
                    }
                    placeholder="30 Days"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Agency Signatory Name
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.agencySignatoryName || ''}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: { ...activePage.data!, agencySignatoryName: e.target.value }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Agency Signatory Title
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.agencySignatoryTitle || ''}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: { ...activePage.data!, agencySignatoryTitle: e.target.value }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Client Signatory Name
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.clientSignatoryName || ''}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: { ...activePage.data!, clientSignatoryName: e.target.value }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Client Signatory Title
                    </label>
                    <input
                      type="text"
                      value={activePage.data?.clientSignatoryTitle || ''}
                      onChange={(e) =>
                        updateActivePage({
                          ...activePage,
                          data: { ...activePage.data!, clientSignatoryTitle: e.target.value }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Footer Number
                  </label>
                  <input
                    type="text"
                    value={activePage.footerNumber || ''}
                    onChange={(e) =>
                      updateActivePage({ ...activePage, footerNumber: e.target.value })
                    }
                    placeholder="PROP-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* DELIVERABLES GRID FORM */}
            {activePage.type === 'deliverables-grid' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Deliverables ({activePage.data?.items?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentItems = activePage.data?.items || [];
                        const newItem: DeliverableItem = {
                          id: `d-${Date.now()}`,
                          title: 'New Feature',
                          description: 'Feature details and deliverables.',
                          badge: 'Included'
                        };
                        updateActivePage({
                          ...activePage,
                          data: { ...activePage.data!, items: [...currentItems, newItem] }
                        });
                      }}
                      className="py-1 px-2.5 bg-black hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activePage.data?.items?.map((item, iIdx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) => {
                              const updatedItems = [...activePage.data!.items];
                              updatedItems[iIdx] = { ...updatedItems[iIdx], title: e.target.value };
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, items: updatedItems }
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-bold text-slate-900 flex-1 focus:outline-none focus:border-black"
                          />
                          <input
                            type="text"
                            placeholder="Badge"
                            value={item.badge || ''}
                            onChange={(e) => {
                              const updatedItems = [...activePage.data!.items];
                              updatedItems[iIdx] = { ...updatedItems[iIdx], badge: e.target.value };
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, items: updatedItems }
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 w-24 focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedItems = activePage.data!.items.filter(
                                (_, idx) => idx !== iIdx
                              );
                              updateActivePage({
                                ...activePage,
                                data: { ...activePage.data!, items: updatedItems }
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => {
                            const updatedItems = [...activePage.data!.items];
                            updatedItems[iIdx] = { ...updatedItems[iIdx], description: e.target.value };
                            updateActivePage({
                              ...activePage,
                              data: { ...activePage.data!, items: updatedItems }
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:border-black resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Footer Number
                  </label>
                  <input
                    type="text"
                    value={activePage.footerNumber || ''}
                    onChange={(e) =>
                      updateActivePage({ ...activePage, footerNumber: e.target.value })
                    }
                    placeholder="PROP-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* FREEFORM TEXT FORM - Side-by-Side Editor */}
            {activePage.type === 'freeform' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Footer Number
                  </label>
                  <input
                    type="text"
                    value={activePage.footerNumber || ''}
                    onChange={(e) =>
                      updateActivePage({
                        ...activePage,
                        footerNumber: e.target.value
                      })
                    }
                    placeholder="PROP-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Custom Page Content
                  </label>
                  <textarea
                    value={activePage.data?.content || ''}
                    onChange={(content) =>
                      updateActivePage({
                        ...activePage,
                        data: {
                          heading: activePage.data?.heading || 'Executive Summary',
                          content: content.target.value
                        }
                      })
                    }
                    rows={12}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-black focus:outline-none resize-none"
                    placeholder="Start editing..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Footer Number
              </label>
              <input
                type="text"
                value={activePage.footerNumber || ''}
                onChange={(e) =>
                  updateActivePage({
                    ...activePage,
                    footerNumber: e.target.value
                  })
                }
                placeholder="PROP-2026-001"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
              />
            </div>
          </div>
        )}

      {/* TAB 2: STRUCTURE MANAGER */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Page Structure
            </h4>

            <div className="space-y-2">
              {proposal.pages.map((p, idx) => {
                const isSelected = idx === activePageIndex;
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPage(idx)}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    draggable
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-slate-100 border-black text-slate-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    } ${isDragging ? 'opacity-50 ring-2 ring-black' : ''} ${isDragOver ? 'bg-slate-100 border-blue-500' : ''}`}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  >
                    <button
                      type="button"
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                      draggable
                      className="p-1 text-slate-400 hover:text-slate-900 flex-shrink-0"
                      aria-label="Drag to reorder"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-[11px] font-bold flex items-center justify-center text-slate-900 flex-shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-tight truncate">{p.pageTitle}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">
                          {p.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePage(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePage(idx, 'down');
                        }}
                        disabled={idx === proposal.pages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePage(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-900"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(idx);
                        }}
                        disabled={proposal.pages.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Page Buttons */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
                Add Section Page
              </p>
              <div className="grid grid-cols-2 gap-2">
                {getPageRegistryEntries()
                  .filter(({ type }) => type !== 'cover') // Cover page is typically only the first page
                  .map(({ type, entry }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddPage(type)}
                      className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <entry.icon className="w-3.5 h-3.5 text-slate-900" />
                      {entry.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BRANDING & CLIENT INFO */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
                Client Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    value={proposal.client.name}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        client: { ...proposal.client, name: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={proposal.client.role}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        client: { ...proposal.client, role: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={proposal.client.company}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        client: { ...proposal.client, company: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
                Agency Details
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={proposal.agency.name}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        agency: { ...proposal.agency, name: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Agency Tagline
                  </label>
                  <input
                    type="text"
                    value={proposal.agency.tagline}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        agency: { ...proposal.agency, tagline: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Header Logo Image
                  </label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Header Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                onUpdateProposal({
                                  ...proposal,
                                  agency: { ...proposal.agency, logoUrl: evt.target.result as string }
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {proposal.agency.logoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProposal({
                            ...proposal,
                            agency: { ...proposal.agency, logoUrl: '' }
                          })
                        }
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Header Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {proposal.agency.logoUrl && (
                    <div className="p-2 mb-1 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                      <img src={proposal.agency.logoUrl} alt="Header Logo Preview" className="h-6 max-w-[120px] object-contain" />
                      <span className="text-[10px] text-slate-400">Header logo loaded</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={proposal.agency.logoUrl || ''}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        agency: { ...proposal.agency, logoUrl: e.target.value }
                      })
                    }
                    placeholder="Or paste URL (https://...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Footer Logo Image
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Footer displays strictly this uploaded logo image only (no text content).
                  </p>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Footer Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                onUpdateProposal({
                                  ...proposal,
                                  agency: { ...proposal.agency, footerLogoUrl: evt.target.result as string }
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {proposal.agency.footerLogoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProposal({
                            ...proposal,
                            agency: { ...proposal.agency, footerLogoUrl: '' }
                          })
                        }
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Footer Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {proposal.agency.footerLogoUrl && (
                    <div className="p-2 mb-1 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                      <img src={proposal.agency.footerLogoUrl} alt="Footer Logo Preview" className="h-6 max-w-[120px] object-contain" />
                      <span className="text-[10px] text-emerald-600 font-medium">âœ“ Footer logo ready</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={proposal.agency.footerLogoUrl || ''}
                    onChange={(e) =>
                      onUpdateProposal({
                        ...proposal,
                        agency: { ...proposal.agency, footerLogoUrl: e.target.value }
                      })
                    }
                    placeholder="Or paste URL (https://...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DESIGN & THEME */}
        {activeTab === 'design' && (
          <ThemeSelector
            theme={proposal.theme}
            onChange={(updatedTheme) => onUpdateProposal({ ...proposal, theme: updatedTheme })}
          />
        )}
      </div>
    </div>
  );
};
