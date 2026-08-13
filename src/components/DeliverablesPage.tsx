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
  data?: DeliverablesPageData;
  pageNumber?: number;
  totalPages?: number;
}

export const DeliverablesPage: React.FC<DeliverablesPageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages
}) => {
  const items = data?.items || [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-10 select-none">
      <WatermarkOverlay theme={theme} agency={agency} />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Deliverables Grid */}
        <div className="grid grid-cols-2 gap-6 flex-1 items-start my-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {item.badge && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">
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
