import React from "react";
import { ProposalAgency, ProposalTheme } from "../types";

interface PageFooterProps {
  agency: ProposalAgency;
  theme: ProposalTheme;
  pageNumber?: number;
  totalPages?: number;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  agency,
  theme,
  pageNumber,
  totalPages,
}) => {
  const showFooter = theme.showFooter ?? theme.showFooterLogo ?? true;
  if (!showFooter) return null;

  const footerLogoUrl =
    theme.footerLogoUrl || agency.footerLogoUrl || "/SD-LOGO.png";
  const [logoSrc, setLogoSrc] = React.useState(footerLogoUrl);

  const customFooterText = theme.customFooterText || '';

  return (
    <div className="relative z-10 flex items-center justify-between border-t border-slate-100 min-h-[32px] sm:min-h-[36px]">
      {/* Left: Footer Logo */}
      {footerLogoUrl ? (
        <div className="flex items-center gap-2">
          <img
            src={logoSrc}
            alt="Footer Logo"
            className="h-6 sm:h-8 max-w-[120px] sm:max-w-[140px] object-contain"
            referrerPolicy="no-referrer"
            onError={() => setLogoSrc("/SD-LOGO.png")}
          />
        </div>
      ) : null}

      {/* Right: Agency Info or Custom Text */}
      <div className="flex items-center text-right flex-shrink-0 ml-auto">
        {customFooterText ? (
          <p className="text-[10px] font-semibold text-slate-500">{customFooterText}</p>
        ) : (
          <>
            <p className="text-[10px] font-bold text-slate-700 ml-2">{agency.name}</p>
            {agency.tagline && (
              <p className="text-[9px] font-medium text-slate-400 ml-2 mt-0.5">{agency.tagline}</p>
            )}
            {(agency.website || agency.email) && (
              <p className="text-[9px] text-slate-400 ml-2 mt-0.5">{agency.website || agency.email}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
