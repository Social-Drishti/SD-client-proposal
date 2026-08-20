import React from 'react';
import { ProposalAgency, ProposalTheme, PricingPageData } from '../types';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';

interface PricingPageProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
  data: PricingPageData;
  pageNumber?: number;
  totalPages?: number;
  footerNumber?: string;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages,
  footerNumber
}) => {
  const highlightTitle = data.highlightBoxTitle || 'Monthly – INR 1,00,000 + 18% GST';
  const highlightSubtitle = data.highlightBoxSubtitle || '(Minimum Lock-in Period 6 Months)';
  const notesHeader = data.notesHeader || 'Note';
  const notes = data.notes || [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Highlighted Price Pill Container */}
        <div className="my-4 sm:my-6">
          <div className="bg-[#0b1329] text-white rounded-xl sm:rounded-2xl py-4 sm:py-5 px-6 sm:px-8 text-center shadow-md border border-slate-800">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {highlightTitle}
            </h3>
          </div>
          {highlightSubtitle && (
            <p className="text-center text-sm font-semibold text-slate-600 mt-2 sm:mt-3">
              {highlightSubtitle}
            </p>
          )}
        </div>

        {/* Note Section */}
        {notes.length > 0 && (
          <div className="mt-6 sm:mt-10">
            <h4 className="text-base sm:text-lg font-semibold text-red-600 mb-2 sm:mb-3">
              {notesHeader}
            </h4>
            <div className="space-y-2 sm:space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="text-xs sm:text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">{note.title}</span>
                  {' – '}
                  <span>{note.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PageFooter
        agency={agency}
        theme={theme}
        pageNumber={pageNumber}
        totalPages={totalPages}
        footerNumber={footerNumber}
      />
    </div>
  );
};