import React from 'react';
import { ProposalPage, ProposalAgency, ProposalClient, ProposalTheme } from '../types';
import { CoverPage } from './CoverPage';
import { CategoryTablePage } from './CategoryTablePage';
import { PricingPage } from './PricingPage';
import { DeliverablesPage } from './DeliverablesPage';
import { MilestonesPage } from './MilestonesPage';
import { TermsPage } from './TermsPage';
import { FreeformPage } from './FreeformPage';

interface ProposalPageCanvasProps {
  page: ProposalPage;
  agency: ProposalAgency;
  client: ProposalClient;
  theme: ProposalTheme;
  pageNumber: number;
  totalPages: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ProposalPageCanvas: React.FC<ProposalPageCanvasProps> = ({
  page,
  agency,
  client,
  theme,
  pageNumber,
  totalPages,
  isSelected,
  onClick
}) => {
  const getFontClass = () => {
    switch (theme.fontFamily) {
      case 'Outfit':
        return 'font-outfit';
      case 'Playfair Display':
        return 'font-playfair';
      case 'Inter':
        return 'font-inter';
      default:
        return 'font-jakarta';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`a4-page transition-all duration-200 relative ${
        isSelected
          ? 'ring-2 ring-black ring-offset-4 ring-offset-[#F1F3F5] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.12)]'
          : 'shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] border border-slate-200'
      } ${getFontClass()}`}
    >
      {page.type === 'cover' && (
        <CoverPage
          agency={agency}
          client={client}
          data={page.coverData}
          theme={theme}
        />
      )}

      {page.type === 'category-table' && (
        <CategoryTablePage
          pageTitle={page.pageTitle}
          agency={agency}
          theme={theme}
          data={page.tableData}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}

      {page.type === 'pricing-highlight' && (
        <PricingPage
          pageTitle={page.pageTitle}
          agency={agency}
          theme={theme}
          pricingData={page.pricingData}
          tableData={page.tableData}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}

      {page.type === 'deliverables-grid' && (
        <DeliverablesPage
          pageTitle={page.pageTitle}
          agency={agency}
          theme={theme}
          data={page.deliverablesData}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}

      {page.type === 'milestones' && (
        <MilestonesPage
          pageTitle={page.pageTitle}
          agency={agency}
          theme={theme}
          data={page.milestonesData}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}

      {page.type === 'terms-signature' && (
        <TermsPage
          pageTitle={page.pageTitle}
          agency={agency}
          client={client}
          theme={theme}
          data={page.termsData}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}

      {page.type === 'freeform' && (
        <FreeformPage
          pageTitle={page.pageTitle}
          agency={agency}
          theme={theme}
          data={page.freeformData}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};
