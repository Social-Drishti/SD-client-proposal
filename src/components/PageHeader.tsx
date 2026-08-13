import React from 'react';
import { ProposalAgency, ProposalTheme } from '../types';

interface PageHeaderProps {
  pageTitle: string;
  agency: ProposalAgency;
  theme: ProposalTheme;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ pageTitle, agency, theme }) => {
  const showHeader = theme.showHeader ?? theme.showHeaderLogo ?? theme.showLogoOnPages ?? true;
  const logoUrl = theme.headerLogoUrl || agency.logoUrl || '/social_drishti_logo.jpg';
  
  // Custom header text or fallback
  const headerLeftText = theme.customHeaderLeftText !== undefined ? theme.customHeaderLeftText : agency.name;
  const headerRightText = theme.customHeaderRightText !== undefined ? theme.customHeaderRightText : (agency.website || '');

  return (
    <div className="mb-6">
      {/* Top Header Bar */}
      {showHeader && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 min-h-[52px]">
          {/* Left Text / Spacer */}
          <div className="flex-1 flex justify-start">
            {!logoUrl && headerLeftText ? (
              <span className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                {headerLeftText}
              </span>
            ) : null}
          </div>

          {/* Centered Big Logo */}
          <div className="flex-[3] flex justify-center items-center px-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Header Logo"
                className="h-16 sm:h-20 max-h-24 max-w-[480px] w-auto object-contain py-0.5 filter drop-shadow-xs transition-all"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to default brand logo if custom URL fails to load
                  (e.target as HTMLImageElement).src = '/social_drishti_logo.jpg';
                }}
              />
            ) : null}
          </div>

          {/* Right Text / Website */}
          <div className="flex-1 flex justify-end">
            {headerRightText ? (
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                {headerRightText}
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Main Page Title with Vertical Accent Bar */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-2.5 h-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: theme.accentColor }}
        />
        <h2
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: theme.primaryColor }}
        >
          {pageTitle}
        </h2>
      </div>

      {/* Horizontal Divider */}
      <div
        className="w-full h-[2.5px] mt-4"
        style={{ backgroundColor: theme.primaryColor }}
      />
    </div>
  );
};
