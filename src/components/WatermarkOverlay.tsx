import React from "react";
import { ProposalAgency, ProposalTheme } from "../types";

interface WatermarkOverlayProps {
  theme: ProposalTheme;
  agency: ProposalAgency;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  theme,
  agency,
}) => {
  const showWatermark = theme.showWatermark ?? true;
  if (!showWatermark) return null;

  const watermarkType = theme.watermarkType || "logo";
  const logoUrl =
    theme.watermarkLogoUrl ||
    theme.headerLogoUrl ||
    agency.logoUrl ||
    agency.footerLogoUrl ||
    "/SDLOGO.png";

  const watermarkText = theme.watermarkText || agency.name || "CONFIDENTIAL";
  const opacity = theme.watermarkOpacity ?? 0.06;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden p-8">
      {watermarkType === "logo" && logoUrl ? (
        <img
          src={logoUrl}
          alt="Watermark"
          className="w-3/4 max-w-xl max-h-[65%] object-contain transition-opacity"
          style={{ opacity: opacity }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/SD-LOGO.png";
          }}
        />
      ) : (
        <div
          className="transform -rotate-30 text-center font-black tracking-widest uppercase whitespace-nowrap text-slate-900 transition-opacity"
          style={{
            opacity: opacity,
            fontSize: "min(7vw, 64px)",
            letterSpacing: "0.15em",
          }}
        >
          {watermarkText}
        </div>
      )}
    </div>
  );
};
