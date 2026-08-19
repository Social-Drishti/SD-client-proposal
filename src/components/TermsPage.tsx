import React from 'react';
import { ProposalAgency, ProposalClient, ProposalTheme, TermsPageData } from '../types';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { WatermarkOverlay } from './WatermarkOverlay';

interface TermsPageProps {
  pageTitle: string;
  agency: ProposalAgency;
  client: ProposalClient;
  theme: ProposalTheme;
  data: TermsPageData;
  pageNumber?: number;
  totalPages?: number;
  footerNumber?: string;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  pageTitle,
  agency,
  client,
  theme,
  data,
  pageNumber,
  totalPages,
  footerNumber
}) => {
  const legalTerms = data.legalTerms || 'This proposal constitutes a formal statement of work. Work shall commence upon receipt of the initial deposit and signed agreement. Either party may terminate with 30 days written notice.';
  const paymentTerms = data.paymentTerms || 'Invoices are payable within 15 days of issue. Late payments incur a 0.5% service fee per month.';
  const agencySignatoryName = data.agencySignatoryName || agency.name;
  const agencySignatoryTitle = data.agencySignatoryTitle || 'Authorized Representative';
  const clientSignatoryName = data.clientSignatoryName || client.name;
  const clientSignatoryTitle = data.clientSignatoryTitle || client.role;

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white overflow-hidden p-6 sm:p-10 select-none">
      <WatermarkOverlay theme={theme} agency={agency} />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <PageHeader pageTitle={pageTitle} agency={agency} theme={theme} />

        {/* Terms Content */}
        <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 sm:mb-10">
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[10px] sm:text-xs tracking-wider mb-2">
              1. General Scope & Services Agreement
            </h4>
            <p className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200/80">
              {legalTerms}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[10px] sm:text-xs tracking-wider mb-2">
              2. Commercial Terms & Payment Schedule
            </h4>
            <p className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200/80">
              {paymentTerms}
            </p>
          </div>
        </div>

        {/* Acceptance Signatures Block */}
        <div className="mt-auto pt-4">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 border-b border-slate-200 pb-2">
            Authorization & Acceptance
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
            {/* Agency Signature */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6 sm:mb-8">
                PREPARED & APPROVED BY
              </p>
              <div className="h-8 sm:h-10 border-b border-slate-300 border-dashed mb-2 flex items-end pb-1">
                <span className="font-serif italic text-base sm:text-lg text-slate-800">
                  {agencySignatoryName}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900">{agencySignatoryName}</p>
              <p className="text-xs text-slate-500">{agencySignatoryTitle}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-2">Date: _______________</p>
            </div>

            {/* Client Signature */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6 sm:mb-8">
                ACCEPTED & AGREED BY CLIENT
              </p>
              <div className="h-8 sm:h-10 border-b border-slate-300 border-dashed mb-2 flex items-end pb-1">
                <span className="font-serif italic text-base sm:text-lg text-slate-800">
                  {clientSignatoryName}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900">{clientSignatoryName}</p>
              <p className="text-xs text-slate-500">{clientSignatoryTitle}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-2">Date: _______________</p>
            </div>
          </div>
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
