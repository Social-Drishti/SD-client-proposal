import React from 'react';
import { ProposalTheme, TemplateStyle } from '../types';
import { Palette, Check, Layout, Type, Upload, Trash2, Image } from 'lucide-react';

interface ThemeSelectorProps {
  theme: ProposalTheme;
  onChange: (updatedTheme: ProposalTheme) => void;
}

const TEMPLATE_PRESETS: Array<{
  id: TemplateStyle;
  name: string;
  description: string;
  primary: string;
  accent: string;
  font: ProposalTheme['fontFamily'];
}> = [
  {
    id: 'social-drishti',
    name: 'Social Drishti Teal',
    description: 'Teal gradient wave with signature amber bar & dark navy pill',
    primary: '#00838f',
    accent: '#f59e0b',
    font: 'Plus Jakarta Sans'
  },
  {
    id: 'navy-gold',
    name: 'Corporate Navy & Gold',
    description: 'Executive navy headers with rich amber gold highlights',
    primary: '#1e3a8a',
    accent: '#d97706',
    font: 'Outfit'
  },
  {
    id: 'emerald-slate',
    name: 'Emerald & Slate',
    description: 'Forest green accents with sleek slate structure',
    primary: '#047857',
    accent: '#10b981',
    font: 'Plus Jakarta Sans'
  },
  {
    id: 'minimal-charcoal',
    name: 'Minimal Charcoal',
    description: 'Monochrome luxury typography with high contrast',
    primary: '#0f172a',
    accent: '#334155',
    font: 'Inter'
  },
  {
    id: 'creative-indigo',
    name: 'Creative Indigo & Violet',
    description: 'Vibrant modern tech and agency design',
    primary: '#4f46e5',
    accent: '#8b5cf6',
    font: 'Plus Jakarta Sans'
  }
];

const FONTS: Array<ProposalTheme['fontFamily']> = [
  'Plus Jakarta Sans',
  'Outfit',
  'Playfair Display',
  'Inter'
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ theme, onChange }) => {
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'headerLogoUrl' | 'footerLogoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...theme,
            [field]: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (presetId: TemplateStyle) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    onChange({
      ...theme,
      templateId: preset.id,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      fontFamily: preset.font
    });
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-slate-900" />
          Template Styles
        </h4>
        <div className="space-y-2.5">
          {TEMPLATE_PRESETS.map((preset) => {
            const isSelected = theme.templateId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'border-black bg-slate-100 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-none">{preset.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-slate-900 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Tweaker */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-900" />
          Color Accents
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Primary Header Color
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono uppercase text-slate-900">{theme.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Vertical Accent Bar
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => onChange({ ...theme, accentColor: e.target.value })}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono uppercase text-slate-900">{theme.accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Selector */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-slate-900" />
          Typography Font
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((font) => {
            const isSelected = theme.fontFamily === font;
            return (
              <button
                key={font}
                type="button"
                onClick={() => onChange({ ...theme, fontFamily: font })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-left ${
                  isSelected
                    ? 'border-black bg-slate-100 text-slate-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {font}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header & Footer Customization */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        {/* Header Controls */}
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
          Header Controls
        </h4>

        <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showHeader ?? theme.showHeaderLogo ?? theme.showLogoOnPages ?? true}
              onChange={(e) =>
                onChange({
                  ...theme,
                  showHeader: e.target.checked,
                  showHeaderLogo: e.target.checked,
                  showLogoOnPages: e.target.checked
                })
              }
              className="rounded border-slate-300 text-black focus:ring-black"
            />
            <span className="text-xs font-bold text-slate-800">Show Header Bar on Pages</span>
          </label>

          {(theme.showHeader ?? theme.showHeaderLogo ?? theme.showLogoOnPages ?? true) && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Header Logo Image
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoFileUpload(e, 'headerLogoUrl')}
                      className="hidden"
                    />
                  </label>
                  {theme.headerLogoUrl && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...theme, headerLogoUrl: '' })}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Header Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {theme.headerLogoUrl && (
                  <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                    <img src={theme.headerLogoUrl} alt="Header Preview" className="h-6 max-w-[120px] object-contain" />
                    <span className="text-[10px] text-slate-400 truncate flex-1">Logo uploaded</span>
                  </div>
                )}
                <input
                  type="text"
                  value={theme.headerLogoUrl || ''}
                  onChange={(e) => onChange({ ...theme, headerLogoUrl: e.target.value })}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Header Left Text (if no logo uploaded)
                </label>
                <input
                  type="text"
                  value={theme.customHeaderLeftText ?? ''}
                  onChange={(e) => onChange({ ...theme, customHeaderLeftText: e.target.value })}
                  placeholder="e.g. My Agency Name (or leave empty)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Header Right Text / Website
                </label>
                <input
                  type="text"
                  value={theme.customHeaderRightText ?? ''}
                  onChange={(e) => onChange({ ...theme, customHeaderRightText: e.target.value })}
                  placeholder="e.g. www.mywebsite.com (or leave empty)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-black focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 pt-2">
          Footer Controls
        </h4>

        <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showFooter ?? theme.showFooterLogo ?? true}
              onChange={(e) => onChange({ ...theme, showFooter: e.target.checked, showFooterLogo: e.target.checked })}
              className="rounded border-slate-300 text-black focus:ring-black"
            />
            <span className="text-xs font-bold text-slate-800">Show Footer Bar on Pages</span>
          </label>

          {(theme.showFooter ?? theme.showFooterLogo ?? true) && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-teal-600" />
                    <span>Footer Logo Image Only</span>
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                  Footer displays strictly the uploaded logo image. All text content has been removed.
                </p>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Footer Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoFileUpload(e, 'footerLogoUrl')}
                      className="hidden"
                    />
                  </label>
                  {theme.footerLogoUrl && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...theme, footerLogoUrl: '' })}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Footer Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {theme.footerLogoUrl && (
                  <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                    <img src={theme.footerLogoUrl} alt="Footer Logo Preview" className="h-6 max-w-[120px] object-contain" />
                    <span className="text-[10px] font-medium text-emerald-600">✓ Footer logo ready</span>
                  </div>
                )}

                <input
                  type="text"
                  value={theme.footerLogoUrl || ''}
                  onChange={(e) => onChange({ ...theme, footerLogoUrl: e.target.value })}
                  placeholder="Or paste footer logo image URL (https://...)"
                  className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 focus:border-black focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <span>Custom Footer Text</span>
                </label>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                  Custom text shown on the right side of the footer. If empty, agency info is displayed.
                </p>
                <input
                  type="text"
                  value={theme.customFooterText || ''}
                  onChange={(e) => onChange({ ...theme, customFooterText: e.target.value })}
                  placeholder="e.g. Confidential — 2026"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 focus:border-black focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Watermark Controls */}
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 pt-2">
          Document Watermark
        </h4>

        <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
          
        </div>
      </div>
    </div>
  );
};
