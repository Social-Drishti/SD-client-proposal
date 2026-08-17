import React from 'react';
import { ProposalAgency, ProposalTheme, FreeformPageData } from '../types';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { WatermarkOverlay } from './WatermarkOverlay';

interface FreeformPageProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
  data: FreeformPageData;
  pageNumber?: number;
  totalPages?: number;
}

export const FreeformPage: React.FC<FreeformPageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages
}) => {
  const content = data.content || 'Add custom proposal text, executive summaries, or brand background here.';

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      <WatermarkOverlay theme={theme} agency={agency} />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Freeform Body Content */}
        <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap flex-1 my-2">
          {content}
        </div>
      </div>

      {/* Page Footer */}
      <PageFooter
        agency={agency}
        theme={theme}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </div>
  );
};
