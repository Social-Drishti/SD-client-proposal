import React from 'react';
import { ProposalAgency, ProposalTheme, CombinedTablePricingData } from '../types';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { WatermarkOverlay } from './WatermarkOverlay';

interface CombinedTablePricingPageProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
  data: CombinedTablePricingData;
  pageNumber?: number;
  totalPages?: number;
}

export const CombinedTablePricingPage: React.FC<CombinedTablePricingPageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages
}) => {
  const { table, pricing } = data;
  const categoryHeader = table.categoryTitle || 'CATEGORY';
  const detailsHeader = table.detailsTitle || 'DETAILS';
  const rows = table.rows || [];

  const highlightTitle = pricing.highlightBoxTitle || 'Monthly – INR 1,00,000 + 18% GST';
  const highlightSubtitle = pricing.highlightBoxSubtitle || '(Minimum Lock-in Period 6 Months)';
  const notesHeader = pricing.notesHeader || 'Note';
  const notes = pricing.notes || [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      <WatermarkOverlay theme={theme} agency={agency} />
      <div className="relative z-10 flex-1 flex flex-col">
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 overflow-hidden">
          {/* Category Table Section */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="grid grid-cols-12 gap-4 sm:gap-6 pb-3 mb-4 border-b border-slate-200 flex-shrink-0">
              <div className="col-span-12 sm:col-span-4">
                <h3
                  className="text-base sm:text-lg font-bold italic tracking-wide uppercase"
                  style={{ color: theme.primaryColor }}
                >
                  {categoryHeader}
                </h3>
              </div>
              <div className="col-span-12 sm:col-span-8 mt-2 sm:mt-0">
                <h3
                  className="text-base sm:text-lg font-bold italic tracking-wide uppercase"
                  style={{ color: theme.primaryColor }}
                >
                  {detailsHeader}
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2">
              {rows.map((row) => {
                const detailLines = row.details.split('\n');

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-12 gap-4 sm:gap-6 items-start py-1"
                  >
                    <div className="col-span-12 sm:col-span-4 pr-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {row.category}
                      </h4>
                    </div>
                    <div className="col-span-12 sm:col-span-8 text-slate-700 text-xs sm:text-sm font-medium leading-relaxed space-y-1">
                      {detailLines.map((line, idx) => {
                        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                        const text = isBullet ? line.trim().replace(/^[•-]\s*/, '') : line;

                        return (
                          <div key={idx} className={isBullet ? 'flex items-start gap-2 pl-1' : ''}>
                            {isBullet && (
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: theme.accentColor }}
                              />
                            )}
                            <span className={isBullet ? 'flex-1' : ''}>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Highlight Section */}
          <div className="flex-shrink-0 border-t border-slate-200 pt-6 sm:pt-8">
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
        </div>
      </div>

      <PageFooter
        agency={agency}
        theme={theme}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </div>
  );
};