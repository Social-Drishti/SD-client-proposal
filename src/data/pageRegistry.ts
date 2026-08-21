import React from 'react';
import { Proposal, ProposalPage, PageType, CoverPageData, TablePageData, PricingPageData, DeliverablesPageData, MilestonesPageData, TermsPageData, FreeformPageData, CombinedTablePricingData } from '../types';
import { CoverPage } from '../components/CoverPage';
import { CategoryTablePage } from '../components/CategoryTablePage';
import { PricingPage } from '../components/PricingPage';
import { DeliverablesPage } from '../components/DeliverablesPage';
import { MilestonesPage } from '../components/MilestonesPage';
import { TermsPage } from '../components/TermsPage';
import { FreeformPage } from '../components/FreeformPage';
import { CombinedTablePricingPage } from '../components/CombinedTablePricingPage';
import { FileText, Table, DollarSign, Briefcase, ListTodo, FilePen, FileType, LayoutGrid } from 'lucide-react';

export interface PageRegistryEntry {
  component: React.ComponentType<{ pageTitle: string; agency: any; theme: any; data: any; pageNumber?: number; totalPages?: number; client?: any }>;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultData: (proposal: Proposal) => any;
}

export const PAGE_REGISTRY: Record<PageType, PageRegistryEntry> = {
  cover: {
    component: CoverPage,
    label: 'Cover Page',
    icon: FileText,
    defaultData: (proposal: Proposal): CoverPageData => ({
      mainTitle: 'Client Proposal Title',
      subtitle: 'Prepared Exclusively For',
      clientName: proposal.client.name,
      clientRole: proposal.client.role,
      dateText: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    }),
  },
  'category-table': {
    component: CategoryTablePage,
    label: 'Category Table',
    icon: Table,
    defaultData: (): TablePageData => ({
      categoryTitle: 'CATEGORY',
      detailsTitle: 'DETAILS',
      rows: [
        { id: `r-${Date.now()}-1`, category: 'Deliverable 1', details: '• High impact specification 1\n• Specification 2' },
        { id: `r-${Date.now()}-2`, category: 'Strategy', details: 'Comprehensive approach and monitoring' },
      ],
    }),
  },
  'pricing-highlight': {
    component: PricingPage,
    label: 'Pricing Highlight',
    icon: DollarSign,
    defaultData: (): PricingPageData => ({
      highlightBoxTitle: 'Monthly – ₹4,999 + 18% GST',
      highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
      notesHeader: 'Note',
      notes: [
        { id: `n-${Date.now()}`, title: 'Payment Terms', description: 'One service per month.' },
      ],
    }),
  },
  'deliverables-grid': {
    component: DeliverablesPage,
    label: 'Deliverables Grid',
    icon: Briefcase,
    defaultData: (): DeliverablesPageData => ({
      sectionTitle: 'Core Features',
      items: [
        { id: `d-${Date.now()}-1`, title: 'Feature 1', description: 'Feature details and deliverables.', badge: 'Included' },
        { id: `d-${Date.now()}-2`, title: 'Feature 2', description: 'Feature details and deliverables.', badge: 'Premium' },
      ],
    }),
  },
  milestones: {
    component: MilestonesPage,
    label: 'Milestones',
    icon: ListTodo,
    defaultData: (): MilestonesPageData => ({
      sectionTitle: 'Project Milestones',
      steps: [
        { id: `m-${Date.now()}-1`, phase: 'Phase 1', title: 'Discovery & Planning', duration: 'Week 1-2', deliverables: 'Requirements document, project plan' },
        { id: `m-${Date.now()}-2`, phase: 'Phase 2', title: 'Design & Prototyping', duration: 'Week 3-4', deliverables: 'UI designs, interactive prototype' },
      ],
    }),
  },
  'terms-signature': {
    component: TermsPage,
    label: 'Terms & Signature',
    icon: FilePen,
    defaultData: (proposal: Proposal): TermsPageData => ({
      legalTerms: 'This proposal represents the entire agreement between parties.',
      paymentTerms: 'Payment due 15 days from invoice date.',
      validUntil: '30 Days',
      agencySignatoryName: proposal.agency.name,
      agencySignatoryTitle: 'Authorized Representative',
      clientSignatoryName: proposal.client.name,
      clientSignatoryTitle: proposal.client.role,
    }),
  },
  freeform: {
    component: FreeformPage,
    label: 'Freeform Text',
    icon: FileType,
    defaultData: (): FreeformPageData => ({
      heading: 'Executive Summary',
      content: 'Add your custom proposal narrative here.',
    }),
  },
  'combined-table-pricing': {
    component: CombinedTablePricingPage,
    label: 'Combined Table & Pricing',
    icon: LayoutGrid,
    defaultData: (): CombinedTablePricingData => ({
      table: {
        categoryTitle: 'CATEGORY',
        detailsTitle: 'DETAILS',
        rows: [
          { id: `r-${Date.now()}-1`, category: 'Deliverable 1', details: '• High impact specification 1\n• Specification 2' },
          { id: `r-${Date.now()}-2`, category: 'Strategy', details: 'Comprehensive approach and monitoring' },
        ],
      },
      pricing: {
        highlightBoxTitle: 'Monthly – ₹4,999 + 18% GST',
        highlightBoxSubtitle: '(Minimum Lock-in Period 6 Months)',
        notesHeader: 'Note',
        notes: [
          { id: `n-${Date.now()}`, title: 'Payment Terms', description: 'Invoices issued monthly in advance.' },
        ],
      },
    }),
  },
};

export function createPage(type: PageType, proposal: Proposal, overrides?: Partial<ProposalPage>): ProposalPage {
  const entry = PAGE_REGISTRY[type];
  const defaultData = entry.defaultData(proposal);

  const basePage: ProposalPage = {
    id: `page-${Date.now()}`,
    pageTitle: entry.label,
    type,
    data: defaultData,
    ...overrides,
  };

  return basePage;
}

export function getPageRegistryEntries(): Array<{ type: PageType; entry: PageRegistryEntry }> {
  return Object.entries(PAGE_REGISTRY).map(([type, entry]) => ({
    type: type as PageType,
    entry,
  }));
}