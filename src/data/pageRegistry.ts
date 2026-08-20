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
  'smm-scope': {
    component: CategoryTablePage,
    label: 'Social Media Management (Scope)',
    icon: Table,
    defaultData: (proposal: Proposal): TablePageData => ({
      categoryTitle: 'CATEGORY',
      detailsTitle: 'DETAILS',
      rows: [
        {
          id: `r1`,
          category: 'Platforms',
          details: 'Instagram, Facebook, Linkedin, Youtube',
        },
        {
          id: `r2`,
          category: 'Posts',
          details: [
            '25 posts per month (Instagram, Facebook)',
            '10 posts per month (Linkedin)',
            '15 Story per month',
            '18 Reels, Remaining Static/Carousel',
            'Grid planning',
            'Aesthetic looks, Moodboard',
          ],
        },
        {
          id: `r3`,
          category: 'Strategy',
          details: [
            'Hashtag research and social media strategy',
            'Content and brand positioning planning',
            'Monthly social media strategy',
            'Posting and scheduling',
            'ORM (Online Reputation Management)',
          ],
        },
        {
          id: `r4`,
          category: 'Optimization',
          details: 'Page optimization & periodic suggestions based on research',
        },
        {
          id: `r5`,
          category: 'Content',
          details: [
            'Monthly content calendar planning',
            'Copywriting and caption writing',
          ],
        },
        {
          id: `r6`,
          category: 'Designing',
          details: 'Making visual creatives based on brand tonality (2 revisions per post on static creatives)',
        },
      ],
    }),
  },
  'smm-operations': {
    component: CategoryTablePage,
    label: 'Social Media Management (Operations)',
    icon: Table,
    defaultData: (proposal: Proposal): TablePageData => ({
      categoryTitle: 'CATEGORY',
      detailsTitle: 'DETAILS',
      rows: [
        {
          id: `r7`,
          category: 'Scheduling & Publishing',
          details: 'Optimal time posting on decided platforms',
        },
        {
          id: `r8`,
          category: 'Engagement',
          details: 'Image/location tagging',
        },
        {
          id: `r9`,
          category: 'Monitoring',
          details: 'Community management (comment and DM monitoring)',
        },
        {
          id: `r10`,
          category: 'Reporting',
          details: 'Monthly performance report and insights',
        },
        {
          id: `r11`,
          category: 'Complimentary',
          details: 'Festive stories',
        },
      ],
    }),
  },
  'video-production': {
    component: CategoryTablePage,
    label: 'Video Production',
    icon: LayoutGrid,
    defaultData: (proposal: Proposal): TablePageData => ({
      categoryTitle: 'CATEGORY',
      detailsTitle: 'DETAILS',
      rows: [
        {
          id: `v1`,
          category: 'Video shoot',
          details: [
            '3 video shoot monthly',
            '2 Podcasts / 1 on-site shoot',
            'Professional camera setup',
            'Lighting setup',
            'Videographer | Photographer + 1 assistant',
            'Complete shoot coordination',
            'Topic suggestions will be provided by our team',
          ],
        },
        {
          id: `v2`,
          category: 'Duration of videos',
          details: '30 secs – 90 secs',
        },
        {
          id: `v3`,
          category: 'Editing',
          details: 'Editing, colour grade, text overlays and background music',
        },
        {
          id: `v4`,
          category: 'Strategy',
          details: 'Shoot planning & shot list preparation before each session',
        },
        {
          id: `v5`,
          category: 'Video Concept',
          details: 'The video concept will be planned by our team.',
        },
        {
          id: `v6`,
          category: 'Shot list & prop checklist',
          details: 'Prop requirement checklist will be shared in advance, client need to arrange',
        },
        {
          id: `v7`,
          category: 'Video Reference',
          details: 'Reference Videos per concept will be shared by us for client alignment before shoot',
        },
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