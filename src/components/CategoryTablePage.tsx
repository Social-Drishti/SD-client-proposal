import React from 'react';
import { ProposalAgency, ProposalTheme, TablePageData } from '../types';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { WatermarkOverlay } from './WatermarkOverlay';

interface CategoryTablePageProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
  data: TablePageData;
  pageNumber?: number;
  totalPages?: number;
  footerNumber?: string;
}

export const CategoryTablePage: React.FC<CategoryTablePageProps> = ({
  pageTitle,
  agency,
  theme,
  data,
  pageNumber,
  totalPages,
  footerNumber
}) => {
  const categoryHeader = data.categoryTitle || 'CATEGORY';
  const detailsHeader = data.detailsTitle || 'DETAILS';
  const rows = data.rows || [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      {/* Background Watermark Overlay */}
      <WatermarkOverlay theme={theme} agency={agency} />

      {/* Main Page Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 pb-3 mb-4 border-b border-slate-200">
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

        {/* Table Rows */}
        <div className="flex-1 flex flex-col justify-start space-y-4 sm:space-y-6">
          {rows.map((row) => {
            const detailLines = row.details.split('\n');

            return (
              <div
                key={row.id}
                className="grid grid-cols-12 gap-4 sm:gap-6 items-start py-1"
              >
                {/* Category Name Column */}
                <div className="col-span-12 sm:col-span-4 pr-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {row.category}
                  </h4>
                </div>

                {/* Details Description Column */}
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
