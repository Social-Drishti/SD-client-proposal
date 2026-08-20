import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ViewState {
  zoomLevel: number;
  previewModeOnly: boolean;
  sidebarOpen: boolean;
  isMobile: boolean;
  fabMenuOpen: boolean;
}

interface ViewContextValue extends ViewState {
  setZoomLevel: (level: number) => void;
  togglePreviewMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  setFabMenuOpen: (open: boolean) => void;
}

const ViewContext = createContext<ViewContextValue | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [zoomLevel, setZoomLevelState] = useState<number>(0.85);
  const [previewModeOnly, setPreviewModeOnly] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpenState] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [fabMenuOpen, setFabMenuOpen] = useState<boolean>(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpenState(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setZoomLevelState(Math.max(0.4, Math.min(1.3, level)));
  }, []);

  const togglePreviewMode = useCallback(() => {
    setPreviewModeOnly((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
  }, []);

  return (
    <ViewContext.Provider value={{
      zoomLevel,
      previewModeOnly,
      sidebarOpen,
      isMobile,
      fabMenuOpen,
      setZoomLevel,
      togglePreviewMode,
      setSidebarOpen,
      setFabMenuOpen,
    }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useViewContext() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
}