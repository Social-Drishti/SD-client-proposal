export type TemplateStyle = 
  | 'social-drishti'
  | 'navy-gold'
  | 'emerald-slate'
  | 'minimal-charcoal'
  | 'creative-indigo';

export type PageType = 
  | 'cover'
  | 'category-table'
  | 'fixed-category-table'
  | 'pricing-highlight'
  | 'deliverables-grid'
  | 'milestones'
  | 'terms-signature'
  | 'freeform'
  | 'combined-table-pricing';

export interface CategoryTableRow {
  id: string;
  category: string;
  details: string | string[];
}

export interface TablePageData {
  categoryTitle: string;
  detailsTitle: string;
  rows: CategoryTableRow[];
}

export const FIXED_CATEGORIES = [
  'Platforms',
  'Posts',
  'Strategy',
  'Optimization',
  'Designing',
] as const;

export type FixedCategory = (typeof FIXED_CATEGORIES)[number];

export interface FixedCategoryTableRow {
  id: string;
  category: FixedCategory;
  details: string | string[];
}

export interface FixedCategoryTableData {
  rows: FixedCategoryTableRow[];
}

export interface PricingNote {
  id: string;
  title: string;
  description: string;
}

export interface PricingPageData {
  highlightBoxTitle: string;
  highlightBoxSubtitle: string;
  notesHeader: string;
  notes: PricingNote[];
}

export interface CombinedTablePricingData {
  table: TablePageData;
  pricing: PricingPageData;
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

export type ProposalPageData =
  | CoverPageData
  | TablePageData
  | FixedCategoryTableData
  | PricingPageData
  | DeliverablesPageData
  | MilestonesPageData
  | TermsPageData
  | FreeformPageData;

export type ProposalPage =
  | { id: string; pageTitle: string; type: 'cover'; data: CoverPageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'category-table'; data: TablePageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'fixed-category-table'; data: FixedCategoryTableData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'pricing-highlight'; data: PricingPageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'deliverables-grid'; data: DeliverablesPageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'milestones'; data: MilestonesPageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'terms-signature'; data: TermsPageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'freeform'; data: FreeformPageData; accentBarColor?: string; footerNumber?: string }
  | { id: string; pageTitle: string; type: 'combined-table-pricing'; data: CombinedTablePricingData; accentBarColor?: string; footerNumber?: string };

export interface ProposalAgency {
  name: string;
  tagline: string;
  logoUrl?: string;
  footerLogoUrl?: string;
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
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
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

export interface LegacyProposalPage {
  id: string;
  pageTitle: string;
  type: PageType;
  accentBarColor?: string;
  coverData?: CoverPageData;
  tableData?: TablePageData;
  pricingData?: PricingPageData;
  deliverablesData?: DeliverablesPageData;
  milestonesData?: MilestonesPageData;
  termsData?: TermsPageData;
  freeformData?: FreeformPageData;
}

export interface LegacyProposal extends Omit<Proposal, 'pages'> {
  pages: LegacyProposalPage[];
}

export function migrateProposalPage(oldPage: LegacyProposalPage): ProposalPage {
  const base = {
    id: oldPage.id,
    pageTitle: oldPage.pageTitle,
    type: oldPage.type,
    accentBarColor: oldPage.accentBarColor,
  };

  switch (oldPage.type) {
    case 'cover': {
      const page = base as { id: string; pageTitle: string; type: 'cover'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.coverData ?? {
          mainTitle: 'Client Proposal',
          subtitle: 'Prepared Exclusively For',
          clientName: '',
          clientRole: '',
          dateText: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        },
      };
    }
    case 'category-table': {
      const page = base as { id: string; pageTitle: string; type: 'category-table'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.tableData ?? {
          categoryTitle: 'CATEGORY',
          detailsTitle: 'DETAILS',
          rows: [],
        },
      };
    }
    case 'fixed-category-table': {
      const page = base as { id: string; pageTitle: string; type: 'fixed-category-table'; accentBarColor?: string };
      return {
        ...page,
        data: {
          rows: FIXED_CATEGORIES.map((category, i) => ({
            id: `fcr-${i}`,
            category,
            details: '',
          })),
        },
      };
    }
    case 'pricing-highlight': {
      const page = base as { id: string; pageTitle: string; type: 'pricing-highlight'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.pricingData ?? {
          highlightBoxTitle: 'Monthly – $5,000 + Taxes',
          highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
          notesHeader: 'Note',
          notes: [],
        },
      };
    }
    case 'deliverables-grid': {
      const page = base as { id: string; pageTitle: string; type: 'deliverables-grid'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.deliverablesData ?? {
          sectionTitle: 'Core Features',
          items: [],
        },
      };
    }
    case 'milestones': {
      const page = base as { id: string; pageTitle: string; type: 'milestones'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.milestonesData ?? {
          sectionTitle: 'Project Milestones',
          steps: [],
        },
      };
    }
    case 'terms-signature': {
      const page = base as { id: string; pageTitle: string; type: 'terms-signature'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.termsData ?? {
          legalTerms: 'This proposal represents the entire agreement between parties.',
          paymentTerms: 'Payment due 15 days from invoice date.',
          validUntil: '30 Days',
          agencySignatoryName: '',
          agencySignatoryTitle: 'Authorized Representative',
          clientSignatoryName: '',
          clientSignatoryTitle: '',
        },
      };
    }
    case 'freeform': {
      const page = base as { id: string; pageTitle: string; type: 'freeform'; accentBarColor?: string };
      return {
        ...page,
        data: oldPage.freeformData ?? {
          heading: 'Executive Summary',
          content: 'Add your custom proposal narrative here.',
        },
      };
    }
    case 'combined-table-pricing': {
      const page = base as { id: string; pageTitle: string; type: 'combined-table-pricing'; accentBarColor?: string };
      return {
        ...page,
        data: {
          table: oldPage.tableData ?? {
            categoryTitle: 'CATEGORY',
            detailsTitle: 'DETAILS',
            rows: [],
          },
          pricing: oldPage.pricingData ?? {
highlightBoxTitle: 'Monthly – ₹4,999 + 18% GST',
            highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
            notesHeader: 'Note',
            notes: [],
          },
        },
      };
    }
    default:
      const _exhaustive: never = oldPage.type;
      throw new Error(`Unknown page type: ${_exhaustive}`);
  }
}

export function migrateProposal(oldProposal: LegacyProposal): Proposal {
  return {
    ...oldProposal,
    pages: oldProposal.pages.map(migrateProposalPage),
  };
}

export function isLegacyProposal(proposal: any): proposal is LegacyProposal {
  if (!proposal || !Array.isArray(proposal.pages)) return false;
  const firstPage = proposal.pages[0];
  if (!firstPage) return false;
  return 'coverData' in firstPage || 'tableData' in firstPage || 'pricingData' in firstPage;
}

export interface ExportProgressDetail {
  progress: number;
  currentPage: number;
  totalPages: number;
  status: 'idle' | 'rendering' | 'generating' | 'downloading' | 'complete' | 'error';
  estimatedTimeRemaining?: number;
  errorMessage?: string;
}