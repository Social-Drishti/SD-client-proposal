export type TemplateStyle = 
  | 'social-drishti'
  | 'navy-gold'
  | 'emerald-slate'
  | 'minimal-charcoal'
  | 'creative-indigo';

export type PageType = 
  | 'cover'
  | 'category-table'
  | 'pricing-highlight'
  | 'deliverables-grid'
  | 'milestones'
  | 'terms-signature'
  | 'freeform';

export interface CategoryTableRow {
  id: string;
  category: string;
  details: string; // supports multiline / bullets
}

export interface TablePageData {
  categoryTitle: string;
  detailsTitle: string;
  rows: CategoryTableRow[];
}

export interface PricingNote {
  id: string;
  title: string;
  description: string;
}

export interface PricingPageData {
  highlightBoxTitle: string; // e.g. "Monthly – INR 1,00,000 + 18% GST"
  highlightBoxSubtitle: string; // e.g. "(Minimum Lock-in Period 6 Months)"
  notesHeader: string;
  notes: PricingNote[];
}

export interface DeliverableItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  badge?: string;
}

export interface DeliverablesPageData {
  sectionTitle: string;
  sectionSubtitle?: string;
  items: DeliverableItem[];
}

export interface MilestoneStep {
  id: string;
  phase: string;
  title: string;
  duration: string;
  deliverables: string;
}

export interface MilestonesPageData {
  sectionTitle: string;
  steps: MilestoneStep[];
}

export interface TermsPageData {
  legalTerms: string;
  paymentTerms: string;
  validUntil: string;
  agencySignatoryName: string;
  agencySignatoryTitle: string;
  clientSignatoryName: string;
  clientSignatoryTitle: string;
}

export interface CoverPageData {
  mainTitle: string;
  subtitle: string;
  clientName: string;
  clientRole: string;
  dateText: string;
}

export interface FreeformPageData {
  heading: string;
  content: string;
}

export interface ProposalPage {
  id: string;
  pageTitle: string;
  type: PageType;
  accentBarColor?: string; // override for section title vertical bar
  coverData?: CoverPageData;
  tableData?: TablePageData;
  pricingData?: PricingPageData;
  deliverablesData?: DeliverablesPageData;
  milestonesData?: MilestonesPageData;
  termsData?: TermsPageData;
  freeformData?: FreeformPageData;
}

export interface ProposalAgency {
  name: string;
  tagline: string;
  logoUrl?: string; // Header / primary logo URL
  footerLogoUrl?: string; // Footer logo URL
  email: string;
  phone: string;
  website: string;
  address?: string;
}

export interface ProposalClient {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

export interface ProposalTheme {
  templateId: TemplateStyle;
  primaryColor: string; // e.g. #0284c7 or #0f766e
  accentColor: string; // e.g. #f59e0b (amber vertical bar)
  secondaryColor: string; // e.g. #1e293b
  bgGradientStyle: 'teal-wave' | 'navy-slate' | 'minimal-light' | 'emerald-glass' | 'monochrome';
  fontFamily: 'Plus Jakarta Sans' | 'Outfit' | 'Playfair Display' | 'Inter';
  showLogoOnPages: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showHeaderLogo?: boolean;
  showFooterLogo?: boolean;
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  customHeaderLeftText?: string;
  customHeaderRightText?: string;
  customFooterLeftText?: string;
  customFooterText?: string;
  showPageNumbers: boolean;
  showWatermark?: boolean;
  watermarkType?: 'logo' | 'text';
  watermarkText?: string;
  watermarkLogoUrl?: string;
  watermarkOpacity?: number; // 0.03 to 0.20
}

export interface Proposal {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  agency: ProposalAgency;
  client: ProposalClient;
  theme: ProposalTheme;
  pages: ProposalPage[];
}
