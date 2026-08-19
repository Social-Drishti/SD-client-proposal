import React, { useEffect, useRef } from 'react';
import { Proposal, ProposalAgency, ProposalClient, ProposalTheme } from '../types';
import { ProposalPageCanvas } from './ProposalPageCanvas';

const PRINT_PROPOSAL_KEY = 'print-proposal-data';

function getProposalFromStorage(): Proposal | null {
  try {
    const data = sessionStorage.getItem(PRINT_PROPOSAL_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to parse proposal from sessionStorage:', e);
  }
  return null;
}

function clearProposalStorage() {
  try {
    sessionStorage.removeItem(PRINT_PROPOSAL_KEY);
  } catch (e) {
    console.warn('Failed to clear proposal from sessionStorage:', e);
  }
}

interface PrintLayoutProps {
  proposal?: Proposal;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ proposal: propProposal }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [proposal, setProposal] = React.useState<Proposal | null>(propProposal ?? getProposalFromStorage());
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    if (!proposal) {
      const stored = getProposalFromStorage();
      if (stored) {
        setProposal(stored);
      }
    }
  }, [proposal]);

  useEffect(() => {
    if (!proposal) return;

    let mounted = true;

    const waitForFontsAndLayout = async () => {
      try {
        await document.fonts.ready;
        
        await new Promise<void>((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', () => resolve(), { once: true });
          }
        });

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });

        if (mounted && rootRef.current) {
          rootRef.current.setAttribute('data-print-ready', 'true');
          setIsReady(true);
        }
      } catch (e) {
        console.warn('Font loading wait failed:', e);
        if (mounted && rootRef.current) {
          rootRef.current.setAttribute('data-print-ready', 'true');
          setIsReady(true);
        }
      }
    };

    waitForFontsAndLayout();

    return () => {
      mounted = false;
    };
  }, [proposal]);

  useEffect(() => {
    if (isReady) {
      clearProposalStorage();
    }
  }, [isReady]);

  const getFontClass = (fontFamily: string) => {
    switch (fontFamily) {
      case 'Outfit':
        return 'font-outfit';
      case 'Playfair Display':
        return 'font-playfair';
      case 'Inter':
        return 'font-inter';
      default:
        return 'font-jakarta';
    }
  };

  if (!proposal) {
    return (
      <>
        <title>Loading Proposal - Proposal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <div className="min-h-screen bg-white flex items-center justify-center font-jakarta">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4" />
            <p className="text-slate-600">Loading proposal for print...</p>
          </div>
        </div>
      </>
    );
  }

  const fontFamily = proposal.theme.fontFamily;
  const fontUrls: Record<string, string> = {
    'Plus Jakarta Sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  };

  return (
    <>
      <title>{proposal.title} - Proposal</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontUrls[fontFamily] || fontUrls['Plus Jakarta Sans']} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `
      }} />

      <div
        ref={rootRef}
        className={`print-layout ${getFontClass(fontFamily)}`}
        data-proposal-id={proposal.id}
      >
        {proposal.pages.map((page, idx) => (
          <div
            key={page.id}
            className="a4-page print-page"
            style={page.accentBarColor ? { '--accent-bar-color': page.accentBarColor } : undefined}
          >
            <ProposalPageCanvas
              page={page}
              agency={proposal.agency}
              client={proposal.client}
              theme={proposal.theme}
              pageNumber={idx + 1}
              totalPages={proposal.pages.length}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default PrintLayout;