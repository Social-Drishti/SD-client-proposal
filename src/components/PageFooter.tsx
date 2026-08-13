import React from 'react';
import { ProposalAgency, ProposalTheme } from '../types';

interface PageFooterProps {
  agency: ProposalAgency;
  theme: ProposalTheme;
  pageNumber?: number;
  totalPages?: number;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  agency,
  theme
}) => {
  const showFooter = theme.showFooter ?? theme.showFooterLogo ?? true;
  if (!showFooter) return null;

  const footerLogoUrl = theme.footerLogoUrl || agency.footerLogoUrl || '/social_drishti_footer_logo.png';

  return (
    <div className="relative z-10 pt-3 mt-auto flex items-center justify-between border-t border-slate-100 min-h-[32px]">
      {/* Footer displays strictly the uploaded logo only - no text content */}
      {footerLogoUrl ? (
        <div className="flex items-center gap-2">
          <img
            src={footerLogoUrl}
            alt="Footer Logo"
            className="h-8 max-w-[140px] object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/social_drishti_footer_logo.png';
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
