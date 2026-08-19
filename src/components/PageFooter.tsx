import React from "react";
import { ProposalAgency, ProposalTheme } from "../types";

interface PageFooterProps {
  agency: ProposalAgency;
  theme: ProposalTheme;
  pageNumber?: number;
  totalPages?: number;
  footerNumber?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  agency,
  theme,
  pageNumber,
  totalPages,
  footerNumber,
}) => {
  const showFooter = theme.showFooter ?? theme.showFooterLogo ?? true;
  if (!showFooter) return null;

  const footerLogoUrl =
    theme.footerLogoUrl || agency.footerLogoUrl || "/SD-LOGO.png";
  const [logoSrc, setLogoSrc] = React.useState(footerLogoUrl);

  const showLogo = theme.showFooterLogo ?? true;
  const showPageNum = theme.showPageNumbers ?? true;

  return (
    <div className="relative z-10 flex items-center justify-between border-t border-slate-100 min-h-[32px] sm:min-h-[36px] px-2 sm:px-4">
      {/* Left: Footer Logo */}
      {showLogo && footerLogoUrl ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src={logoSrc}
            alt="Footer Logo"
            className="h-6 sm:h-8 max-w-[120px] sm:max-w-[140px] object-contain"
            referrerPolicy="no-referrer"
            onError={() => setLogoSrc("/SD-LOGO.png")}
          />
        </div>
      ) : (
        <div className="w-20 flex-shrink-0" />
      )}

      {/* Center: Page Number */}
      {showPageNum && pageNumber && totalPages ? (
        <div className="flex flex-1 justify-center">
          <span className="text-[10px] font-medium text-slate-400">
            Page {pageNumber} of {totalPages}
          </span>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: Custom Footer Number */}
      {footerNumber ? (
        <div className="flex items-center justify-end flex-shrink-0">
          <span className="text-[10px] font-semibold text-slate-700">
            {footerNumber}
          </span>
        </div>
      ) : (
        <div className="w-20 flex-shrink-0" />
      )}
    </div>
  );
};
