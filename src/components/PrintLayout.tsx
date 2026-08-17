import React, { useEffect, useRef } from 'react';
import { Proposal, ProposalAgency, ProposalClient, ProposalTheme } from '../types';
import { ProposalPageCanvas } from './ProposalPageCanvas';

interface PrintLayoutProps {
  proposal: Proposal;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ proposal }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

        if (rootRef.current) {
          rootRef.current.setAttribute('data-print-ready', 'true');
        }
      } catch (e) {
        console.warn('Font loading wait failed:', e);
        if (rootRef.current) {
          rootRef.current.setAttribute('data-print-ready', 'true');
        }
      }
    };

    waitForFontsAndLayout();
  }, []);

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