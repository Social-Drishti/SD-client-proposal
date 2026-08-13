import { Proposal } from "../types";

export const socialDrishtiProposal: Proposal = {
  id: "prop-social-drishti-001",
  title: "Social Media Management & Video Production Proposal",
  createdAt: "2026-08-07",
  updatedAt: "2026-08-07",
  agency: {
    name: "SOCIAL DRISHTI",
    tagline: "LOOKING BEYOND THE OBVIOUS",
    logoUrl: "/black-sd-logo.png",
    footerLogoUrl: "/SD_LOGO.png",
    email: "info@socialdrishti.com",
    phone: "+91 98765 43210",
    website: "www.socialdrishti.com",
    address: "Goregoan| Mumbai",
  },
  client: {
    name: "Dr. Rajneesh Kant",
    role: "Chiropractor | Osteopath | Physiotherapist",
    company: "Rajneesh Kant Wellness Studio",
    email: "dr.rajneesh@wellness.com",
    phone: "+91 98123 45678",
  },
  theme: {
    templateId: "social-drishti",
    primaryColor: "#00838f", // Teal
    accentColor: "#f59e0b", // Amber vertical bar
    secondaryColor: "#0f172a", // Navy
    bgGradientStyle: "teal-wave",
    fontFamily: "Plus Jakarta Sans",
    showLogoOnPages: true,
    showPageNumbers: true,
    customFooterText: "",
    showWatermark: true,
    watermarkType: "logo",
    watermarkLogoUrl: "/SD_LOGO.png",
    watermarkOpacity: 0.06,
  },
  pages: [
    {
      id: "page-cover",
      pageTitle: "Cover Page",
      type: "cover",
      coverData: {
        mainTitle: "Social Media Management Video Production Proposal",
        subtitle: "Prepared Exclusively For",
        clientName: "Dr. Rajneesh Kant",
        clientRole: "Chiropractor | Osteopath | Physiotherapist",
        dateText: "August 2026",
        showOverlayImage: true,
        bgImageUrl:
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200",
      },
    },
    {
      id: "page-smm-1",
      pageTitle: "Social Media Management (Scope)",
      type: "category-table",
      accentBarColor: "#f59e0b",
      tableData: {
        categoryTitle: "CATEGORY",
        detailsTitle: "DETAILS",
        rows: [
          {
            id: "r1",
            category: "Platforms",
            details: "Instagram, Facebook, Linkedin, Youtube",
          },
          {
            id: "r2",
            category: "Posts",
            details:
              "25 posts per month (Instagram, Facebook)\n10 posts per month (Linkedin)\n15 Story per month\n• 18 Reels, Remaining Static/Carousel,\n• Grid planning\n• Aesthetic looks, Moodboard",
          },
          {
            id: "r3",
            category: "Strategy",
            details:
              "• Hashtag research and social media strategy\n• Content and brand positioning planning\n• Monthly social media strategy\n• Posting and scheduling\n• ORM (Online Reputation Management)",
          },
          {
            id: "r4",
            category: "Optimization",
            details:
              "Page optimization & periodic suggestions based on research",
          },
          {
            id: "r5",
            category: "Content",
            details:
              "Monthly content calendar planning\nCopywriting and caption writing",
          },
          {
            id: "r6",
            category: "Designing",
            details:
              "Making visual creatives based on brand tonality (2 revisions per post on static creatives)",
          },
        ],
      },
    },
    {
      id: "page-smm-2",
      pageTitle: "Social Media Management (Operations)",
      type: "category-table",
      accentBarColor: "#f59e0b",
      tableData: {
        categoryTitle: "CATEGORY",
        detailsTitle: "DETAILS",
        rows: [
          {
            id: "r7",
            category: "Scheduling & Publishing",
            details: "Optimal time posting on decided platforms",
          },
          {
            id: "r8",
            category: "Engagement",
            details: "Image/location tagging,",
          },
          {
            id: "r9",
            category: "Monitoring",
            details: "Community management (comment and DM monitoring)",
          },
          {
            id: "r10",
            category: "Reporting",
            details: "Monthly performance report and insights",
          },
          {
            id: "r11",
            category: "Complimentary",
            details: "Festive stories",
          },
        ],
      },
    },
    {
      id: "page-video",
      pageTitle: "Video Production",
      type: "category-table",
      accentBarColor: "#f59e0b",
      tableData: {
        categoryTitle: "CATEGORY",
        detailsTitle: "DETAILS",
        rows: [
          {
            id: "v1",
            category: "Video shoot",
            details:
              "3 video shoot monthly\n• 2 Podcasts / 1 on-site shoot\n• Professional camera setup\n• Lighting setup\n• Videographer | Photographer + 1 assistant\n• Complete shoot coordination\n• Topic suggestions will be provided by our team",
          },
          {
            id: "v2",
            category: "Duration of videos",
            details: "30 secs – 90 secs",
          },
          {
            id: "v3",
            category: "Editing",
            details:
              "Editing, colour grade, text overlays and background music",
          },
          {
            id: "v4",
            category: "Strategy",
            details:
              "Shoot planning & shot list preparation before each session",
          },
          {
            id: "v5",
            category: "Video Concept",
            details: "The video concept will be planned by our team.",
          },
          {
            id: "v6",
            category: "Shot list & prop checklist",
            details:
              "Prop requirement checklist will be shared in advance, client need to arrange",
          },
          {
            id: "v7",
            category: "Video Reference",
            details:
              "Reference Videos per concept will be shared by us for client alignment before shoot",
          },
        ],
      },
    },
    {
      id: "page-pricing",
      pageTitle: "Investment & Commercials",
      type: "pricing-highlight",
      accentBarColor: "#f59e0b",
      tableData: {
        categoryTitle: "CATEGORY",
        detailsTitle: "DETAILS",
        rows: [
          {
            id: "p1",
            category: "Format",
            details: "Optimised as reels – vertical 9:16 format",
          },
          {
            id: "p2",
            category: "Revision",
            details: "1 revision per video Included",
          },
        ],
      },
      pricingData: {
        highlightBoxTitle: "Monthly – INR 1,00,000 + 18% GST",
        highlightBoxSubtitle: "(Minimum Lock-in Period 6 Months)",
        notesHeader: "Note",
        notes: [
          {
            id: "n1",
            title: "Post Promotion",
            description:
              "If any post requires boosting, it will involve an additional cost, which must be approved and paid by the client in advance.",
          },
          {
            id: "n2",
            title: "Extra Designs",
            description:
              "Any design work outside the agreed scope (e.g., social media post & banner) will be billed as per standard rate card.",
          },
        ],
      },
    },
  ],
};

export const webDevProposal: Proposal = {
  id: "prop-webdev-002",
  title: "Enterprise Web Application & Brand Redesign Proposal",
  createdAt: "2026-08-01",
  updatedAt: "2026-08-05",
  agency: {
    name: "NEXUS DIGITAL STUDIO",
    tagline: "Engineering Digital Futures",
    logoUrl: "",
    email: "hello@nexusdigital.io",
    phone: "+1 (555) 234-5678",
    website: "www.nexusdigital.io",
    address: "San Francisco, CA",
  },
  client: {
    name: "Sarah Jenkins",
    role: "Chief Technology Officer",
    company: "Apex Health Systems",
    email: "s.jenkins@apexhealth.org",
    phone: "+1 (555) 987-6543",
  },
  theme: {
    templateId: "navy-gold",
    primaryColor: "#1e3a8a",
    accentColor: "#d97706",
    secondaryColor: "#0f172a",
    bgGradientStyle: "navy-slate",
    fontFamily: "Outfit",
    showLogoOnPages: true,
    showPageNumbers: true,
    customFooterText: "NEXUS DIGITAL — Apex Health Proposal 2026",
  },
  pages: [
    {
      id: "web-cover",
      pageTitle: "Cover Page",
      type: "cover",
      coverData: {
        mainTitle: "Enterprise Web Application & Portal Redesign",
        subtitle: "Prepared For Apex Health Systems",
        clientName: "Sarah Jenkins",
        clientRole: "Chief Technology Officer",
        dateText: "Q3 2026",
        showOverlayImage: true,
        bgImageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
      },
    },
    {
      id: "web-scope",
      pageTitle: "Scope of Work",
      type: "category-table",
      accentBarColor: "#d97706",
      tableData: {
        categoryTitle: "MODULE",
        detailsTitle: "DELIVERABLE & SPECIFICATIONS",
        rows: [
          {
            id: "ws1",
            category: "Frontend Portal",
            details:
              "• React 19 + TypeScript modern SPA architecture\n• Responsive layout across mobile, tablet & desktop\n• WCAG 2.1 AA Accessibility compliance\n• Fast load times under 1.2s LCP",
          },
          {
            id: "ws2",
            category: "Backend & APIs",
            details:
              "• Node.js REST API microservices with Cloud Run container deployment\n• Encrypted patient data transmission with OAuth2 authentication\n• Real-time web sockets for appointment alerts",
          },
          {
            id: "ws3",
            category: "UI/UX Design System",
            details:
              "• Comprehensive Figma design library with 40+ components\n• Interactive high-fidelity prototypes\n• Custom icon set & brand color palette guidelines",
          },
        ],
      },
    },
    {
      id: "web-pricing",
      pageTitle: "Investment & Payment Milestones",
      type: "pricing-highlight",
      accentBarColor: "#d97706",
      pricingData: {
        highlightBoxTitle: "Total Investment: $38,500 USD",
        highlightBoxSubtitle: "(Fixed Scope Project — 12 Weeks Delivery)",
        notesHeader: "Payment Schedule",
        notes: [
          {
            id: "wn1",
            title: "Deposit (30%)",
            description:
              "$11,550 due upon contract signature to initiate sprint planning.",
          },
          {
            id: "wn2",
            title: "Beta Launch (40%)",
            description:
              "$15,400 due upon completion of staging deployment and user acceptance testing.",
          },
          {
            id: "wn3",
            title: "Final Handover (30%)",
            description:
              "$11,550 due upon production launch and source code repository transfer.",
          },
        ],
      },
    },
  ],
};

export const initialProposalsList: Proposal[] = [
  socialDrishtiProposal,
  webDevProposal,
];
