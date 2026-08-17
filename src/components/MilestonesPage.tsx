import React from 'react';
import { ProposalAgency, ProposalTheme, MilestonesPageData } from '../types';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { WatermarkOverlay } from './WatermarkOverlay';

interface MilestonesPageProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
  data: MilestonesPageData;
  pageNumber?: number;
  totalPages?: number;
}

export const MilestonesPage: React.FC<MilestonesPageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages
}) => {
  const steps = data.steps || [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      <WatermarkOverlay theme={theme} agency={agency} />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Timeline Steps */}
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 sm:space-y-8 my-2 sm:my-4 flex-1">
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="relative pl-6 sm:pl-8">
              {/* Timeline Node Dot */}
              <div
                className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                style={{ backgroundColor: theme.accentColor }}
              />

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: theme.primaryColor }}
                  >
                    {step.phase}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 sm:px-2.5 sm:py-1 rounded-md border border-slate-200">
                    {step.duration}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                  {step.title}
                </h4>
                <p className="text-xs leading-relaxed text-slate-600">
                  {step.deliverables}
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
