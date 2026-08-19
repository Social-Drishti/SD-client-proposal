import React from 'react';
import { ProposalAgency, ProposalTheme, DeliverablesPageData } from '../types';
import { Sparkles } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { WatermarkOverlay } from './WatermarkOverlay';

interface DeliverablesPageProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
  data: DeliverablesPageData;
  pageNumber?: number;
  totalPages?: number;
  footerNumber?: string;
}

export const DeliverablesPage: React.FC<DeliverablesPageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages,
  footerNumber
}) => {
  const items = data.items || [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      <WatermarkOverlay theme={theme} agency={agency} />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Deliverables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-1 items-start my-2 sm:my-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1 sm:mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
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
