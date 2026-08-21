import React from 'react';
import { ProposalPage, ProposalAgency, ProposalClient, ProposalTheme } from '../types';
import { PAGE_REGISTRY } from '../data/pageRegistry';

interface ProposalPageCanvasProps {
  page: ProposalPage;
  agency: ProposalAgency;
  client: ProposalClient;
  theme: ProposalTheme;
  pageNumber: number;
  totalPages: number;
  isSelected?: boolean;
  onClick?: () => void;
  onUpdateCoverDate?: (date: string) => void;
}

export const ProposalPageCanvas: React.FC<ProposalPageCanvasProps> = ({
  page,
  agency,
  client,
  theme,
  pageNumber,
  totalPages,
  isSelected,
  onClick,
  onUpdateCoverDate
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

  // Use switch for exhaustive type checking
  const renderPage = () => {
    switch (page.type) {
      case 'cover': {
        const entry = PAGE_REGISTRY.cover;
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
            onUpdateDate={onUpdateCoverDate}
          />
        );
      }
      case 'category-table': {
        const entry = PAGE_REGISTRY['category-table'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'fixed-category-table': {
        const entry = PAGE_REGISTRY['fixed-category-table'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'service-scope-table': {
        const entry = PAGE_REGISTRY['service-scope-table'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'video-production-table': {
        const entry = PAGE_REGISTRY['video-production-table'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'pricing-highlight': {
        const entry = PAGE_REGISTRY['pricing-highlight'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'deliverables-grid': {
        const entry = PAGE_REGISTRY['deliverables-grid'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'milestones': {
        const entry = PAGE_REGISTRY.milestones;
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'terms-signature': {
        const entry = PAGE_REGISTRY['terms-signature'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'freeform': {
        const entry = PAGE_REGISTRY.freeform;
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      case 'combined-table-pricing': {
        const entry = PAGE_REGISTRY['combined-table-pricing'];
        const Component = entry.component;
        return (
          <Component
            pageTitle={page.pageTitle}
            agency={agency}
            client={client}
            theme={theme}
            data={page.data}
            pageNumber={pageNumber}
            totalPages={totalPages}
            footerNumber={page.footerNumber}
          />
        );
      }
      default: {
        const _exhaustive: never = page as never;
        throw new Error(`Unhandled page type`);
      }
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
      style={page.accentBarColor ? { '--accent-bar-color': page.accentBarColor } : undefined}
    >
      {renderPage()}
    </div>
  );
};