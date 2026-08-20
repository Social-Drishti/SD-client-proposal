import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ProposalPage, ProposalAgency, ProposalClient, ProposalTheme } from '../types';
import { ProposalPageCanvas } from './ProposalPageCanvas';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeablePagesProps {
  pages: ProposalPage[];
  activePageIndex: number;
  onPageChange: (index: number) => void;
  agency: ProposalAgency;
  client: ProposalClient;
  theme: ProposalTheme;
  isMobile?: boolean;
  zoomLevel?: number;
  showPageBadges?: boolean;
  onUpdateCoverDate?: (date: string) => void;
}

export const SwipeablePages: React.FC<SwipeablePagesProps> = ({
  pages,
  activePageIndex,
  onPageChange,
  agency,
  client,
  theme,
  isMobile = false,
  zoomLevel = 1,
  showPageBadges = true,
  onUpdateCoverDate
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentDragOffset, setCurrentDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);

  const pageWidth = isMobile ? '100%' : '210mm';
  const gap = 24;

  const goToPage = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, pages.length - 1));
    onPageChange(clampedIndex);
    setTranslateX(-clampedIndex * (isMobile ? window.innerWidth : 896));
  }, [pages.length, onPageChange, isMobile]);

  useEffect(() => {
    const targetX = -activePageIndex * (isMobile ? window.innerWidth : 896);
    setTranslateX(targetX);
  }, [activePageIndex, isMobile]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setCurrentDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - dragStartX;
    setCurrentDragOffset(deltaX);
    setTranslateX(-activePageIndex * (isMobile ? window.innerWidth : 896) + deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = (isMobile ? window.innerWidth : 896) * 0.25;
    let newIndex = activePageIndex;

    if (currentDragOffset < -threshold && activePageIndex < pages.length - 1) {
      newIndex = activePageIndex + 1;
    } else if (currentDragOffset > threshold && activePageIndex > 0) {
      newIndex = activePageIndex - 1;
    }

    goToPage(newIndex);
    setCurrentDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setCurrentDragOffset(0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStartX;
    setCurrentDragOffset(deltaX);
    setTranslateX(-activePageIndex * (isMobile ? window.innerWidth : 896) + deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = (isMobile ? window.innerWidth : 896) * 0.25;
    let newIndex = activePageIndex;

    if (currentDragOffset < -threshold && activePageIndex < pages.length - 1) {
      newIndex = activePageIndex + 1;
    } else if (currentDragOffset > threshold && activePageIndex > 0) {
      newIndex = activePageIndex - 1;
    }

    goToPage(newIndex);
    setCurrentDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = (isMobile ? window.innerWidth : 896) * 0.25;
    let newIndex = activePageIndex;

    if (currentDragOffset < -threshold && activePageIndex < pages.length - 1) {
      newIndex = activePageIndex + 1;
    } else if (currentDragOffset > threshold && activePageIndex > 0) {
      newIndex = activePageIndex - 1;
    }

    goToPage(newIndex);
    setCurrentDragOffset(0);
  };

  const containerWidth = isMobile 
    ? `${pages.length * 100}vw` 
    : `${pages.length * 896 + (pages.length - 1) * gap}px`;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ touchAction: 'pan-y', userSelect: 'none' }}
    >
      <div
        ref={pagesRef}
        className="flex items-start transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${translateX + currentDragOffset}px)`,
          width: containerWidth,
        }}
      >
        {pages.map((page, idx) => (
          <div
            key={page.id}
            className="flex-shrink-0 flex flex-col items-center w-full"
            style={{
              width: isMobile ? '100vw' : '896px',
              paddingRight: idx < pages.length - 1 ? gap : 0,
              boxSizing: 'border-box',
            }}
          >
            {showPageBadges && (
              <div className="no-print mb-2 flex items-center justify-between w-full max-w-[210mm] px-1 text-slate-500 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Page {idx + 1} of {pages.length} — {page.pageTitle}
                </span>
                {idx === activePageIndex && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-slate-200 px-2 py-0.5 rounded-md">
                    Editing
                  </span>
                )}
              </div>
            )}

            <div className="relative w-full max-w-[210mm]" style={{ transform: `scale(${isMobile ? Math.min(zoomLevel, 0.6) : zoomLevel})`, transformOrigin: 'top center' }}>
              <ProposalPageCanvas
                page={page}
                agency={agency}
                client={client}
                theme={theme}
                pageNumber={idx + 1}
                totalPages={pages.length}
                isSelected={idx === activePageIndex}
                onClick={() => onPageChange(idx)}
                onUpdateCoverDate={page.type === 'cover' ? onUpdateCoverDate : undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {!isMobile && pages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToPage(activePageIndex - 1)}
            disabled={activePageIndex === 0}
            className="no-print absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-black hover:bg-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(activePageIndex + 1)}
            disabled={activePageIndex === pages.length - 1}
            className="no-print absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-black hover:bg-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {isMobile && pages.length > 1 && (
        <div className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg">
          {pages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToPage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activePageIndex
                  ? 'bg-black w-6'
                  : 'bg-slate-400 hover:bg-slate-600'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};