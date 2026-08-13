import React from "react";
import {
  ProposalAgency,
  ProposalClient,
  CoverPageData,
  ProposalTheme,
} from "../types";

interface CoverPageProps {
  agency: ProposalAgency;
  client: ProposalClient;
  data?: CoverPageData;
  theme: ProposalTheme;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  agency,
  client,
  data,
  theme,
}) => {
  const mainTitle = data?.mainTitle || "Client Proposal";
  const clientName = data?.clientName || client.name;
  const clientRole = data?.clientRole || client.role;
  const dateText = data?.dateText || "2026";
  const logoUrl = theme.headerLogoUrl || agency.logoUrl || "/black-sd-logo.png";

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-white select-none p-12">
      {/* Top Section: Centered Big Header Logo + Date Tag */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-100 min-h-[60px]">
        <div className="w-24" /> {/* Spacer to balance layout */}
        {/* Centered Big Logo */}
        <div className="flex-[3] flex justify-center items-center px-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={agency.name}
              className="h-20 sm:h-24 max-h-28 max-w-[540px] w-auto object-contain filter drop-shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/black-sd-logo.png";
              }}
            />
          ) : (
            <span className="text-base font-extrabold tracking-wider text-slate-800 uppercase">
              {agency.name}
            </span>
          )}
        </div>
        {/* Date Tag */}
        <div className="w-24 text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {dateText}
          </span>
        </div>
      </div>

      {/* Hero Section: Main Title + Vertical Accent Bar */}
      <div className="relative z-10 my-auto max-w-2xl py-8">
        <div className="flex items-stretch gap-5 mb-10">
          {/* Vertical Accent Bar */}
          <div
            className="w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: theme.accentColor }}
          />

          <div className="flex flex-col justify-center">
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]"
              style={{ color: theme.primaryColor }}
            >
              {mainTitle}
            </h2>
          </div>
        </div>

        {/* Client Details Section */}
        <div className="pl-8 border-l-2 border-slate-100 py-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            PREPARED FOR
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {clientName}
          </h3>
          <p className="text-base font-medium text-slate-600 mt-1">
            {clientRole}
          </p>
          {client.company && (
            <p className="text-sm font-semibold text-slate-500 mt-1">
              {client.company}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Footer Section: Prepared By */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
            PREPARED BY
          </p>
          <p className="text-sm font-extrabold text-slate-900">{agency.name}</p>
          {agency.tagline && (
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {agency.tagline}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">
            {agency.website || agency.email}
          </p>
          {agency.phone && (
            <p className="text-xs text-slate-400 mt-0.5">{agency.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
};
