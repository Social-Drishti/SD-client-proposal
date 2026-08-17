import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import { ExportProgressDetail } from '../lib/pdfGenerator';

interface ExportState {
  isExporting: boolean;
  exportProgress: number;
  exportProgressDetail: ExportProgressDetail;
  abortController: AbortController | null;
}

interface ExportContextValue extends ExportState {
  startExport: (detail: ExportProgressDetail) => void;
  cancelExport: () => void;
  updateProgress: (detail: Partial<ExportProgressDetail>) => void;
}

const initialExportProgressDetail: ExportProgressDetail = {
  progress: 0,
  currentPage: 0,
  totalPages: 0,
  status: 'idle',
};

const ExportContext = createContext<ExportContextValue | null>(null);

export function ExportProvider({ children }: { children: ReactNode }) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportProgressDetail, setExportProgressDetail] = useState<ExportProgressDetail>(initialExportProgressDetail);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startExport = useCallback((detail: ExportProgressDetail) => {
    abortControllerRef.current = new AbortController();
    setIsExporting(true);
    setExportProgressDetail(detail);
    setExportProgress(detail.progress);
  }, []);

  const cancelExport = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsExporting(false);
    setExportProgressDetail(initialExportProgressDetail);
    setExportProgress(0);
  }, []);

  const updateProgress = useCallback((detail: Partial<ExportProgressDetail>) => {
    setExportProgressDetail((prev) => ({ ...prev, ...detail }));
    if (detail.progress !== undefined) {
      setExportProgress(detail.progress);
    }
  }, []);

  return (
    <ExportContext.Provider value={{
      isExporting,
      exportProgress,
      exportProgressDetail,
      abortController: abortControllerRef.current,
      startExport,
      cancelExport,
      updateProgress,
    }}>
      {children}
    </ExportContext.Provider>
  );
}

export function useExportContext() {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExportContext must be used within an ExportProvider');
  }
  return context;
}