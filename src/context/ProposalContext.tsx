import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Proposal, ProposalPage, PageType, LegacyProposal, migrateProposal, isLegacyProposal } from '../types';
import { initialProposalsList, socialDrishtiProposal } from '../data/initialProposals';

export interface ProposalState {
  proposals: Proposal[];
  activeProposalId: string;
  activePageIndex: number;
  history: Proposal[][];
  historyIndex: number;
  lastSavedAt: number | null;
  saveError: string | null;
}

type ProposalAction =
  | { type: 'INIT'; payload: Proposal[] }
  | { type: 'SET_PROPOSALS'; payload: Proposal[] }
  | { type: 'CREATE_PROPOSAL'; payload: Proposal }
  | { type: 'UPDATE_PROPOSAL'; payload: Proposal }
  | { type: 'DELETE_PROPOSAL'; payload: string }
  | { type: 'SELECT_PROPOSAL'; payload: string }
  | { type: 'SET_ACTIVE_PAGE_INDEX'; payload: number }
  | { type: 'ADD_PAGE'; payload: { proposalId: string; page: ProposalPage } }
  | { type: 'DELETE_PAGE'; payload: { proposalId: string; pageIndex: number } }
  | { type: 'REORDER_PAGE'; payload: { proposalId: string; fromIndex: number; toIndex: number } }
  | { type: 'UPDATE_PAGE_FIELD'; payload: { proposalId: string; pageIndex: number; field: keyof ProposalPage; value: any } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'IMPORT_PROPOSAL'; payload: Proposal }
  | { type: 'SET_LAST_SAVED'; payload: number }
  | { type: 'SET_SAVE_ERROR'; payload: string | null };

const HISTORY_LIMIT = 50;
const AUTOSAVE_DELAY = 2000; // 2 seconds debounce

function proposalReducer(state: ProposalState, action: ProposalAction): ProposalState {
  switch (action.type) {
    case 'INIT': {
      return {
        ...state,
        proposals: action.payload,
        activeProposalId: action.payload[0]?.id || socialDrishtiProposal.id,
        activePageIndex: 0,
        history: [action.payload],
        historyIndex: 0,
      };
    }

    case 'SET_PROPOSALS': {
      return {
        ...state,
        proposals: action.payload,
        activeProposalId: action.payload[0]?.id || state.activeProposalId,
        activePageIndex: 0,
      };
    }

    case 'CREATE_PROPOSAL': {
      const newProposals = [...state.proposals, action.payload];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return {
        ...state,
        proposals: newProposals,
        activeProposalId: action.payload.id,
        activePageIndex: 0,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UPDATE_PROPOSAL': {
      const newProposals = state.proposals.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return {
        ...state,
        proposals: newProposals,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'DELETE_PROPOSAL': {
      const filtered = state.proposals.filter((p) => p.id !== action.payload);
      if (filtered.length === 0) return state;
      const newActiveId = state.activeProposalId === action.payload
        ? filtered[0].id
        : state.activeProposalId;
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(filtered);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return {
        ...state,
        proposals: filtered,
        activeProposalId: newActiveId,
        activePageIndex: 0,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SELECT_PROPOSAL': {
      return {
        ...state,
        activeProposalId: action.payload,
        activePageIndex: 0,
      };
    }

    case 'SET_ACTIVE_PAGE_INDEX': {
      return {
        ...state,
        activePageIndex: action.payload,
      };
    }

    case 'ADD_PAGE': {
      const newProposals = state.proposals.map((p) => {
        if (p.id !== action.payload.proposalId) return p;
        const newPages = [...p.pages, action.payload.page];
        return { ...p, pages: newPages, updatedAt: new Date().toISOString() };
      });
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      const targetProposal = newProposals.find((p) => p.id === action.payload.proposalId);
      return {
        ...state,
        proposals: newProposals,
        activePageIndex: targetProposal ? targetProposal.pages.length - 1 : state.activePageIndex,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'DELETE_PAGE': {
      const newProposals = state.proposals.map((p) => {
        if (p.id !== action.payload.proposalId) return p;
        if (p.pages.length <= 1) return p;
        const newPages = p.pages.filter((_, idx) => idx !== action.payload.pageIndex);
        const newActiveIndex = Math.max(0, Math.min(action.payload.pageIndex, newPages.length - 1));
        return { ...p, pages: newPages, updatedAt: new Date().toISOString() };
      });
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return {
        ...state,
        proposals: newProposals,
        activePageIndex: Math.max(0, action.payload.pageIndex - 1),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'REORDER_PAGE': {
      const newProposals = state.proposals.map((p) => {
        if (p.id !== action.payload.proposalId) return p;
        const newPages = [...p.pages];
        const [moved] = newPages.splice(action.payload.fromIndex, 1);
        newPages.splice(action.payload.toIndex, 0, moved);
        return { ...p, pages: newPages, updatedAt: new Date().toISOString() };
      });
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      let newActiveIndex = state.activePageIndex;
      if (state.activePageIndex === action.payload.fromIndex) {
        newActiveIndex = action.payload.toIndex;
      } else if (
        (action.payload.fromIndex < state.activePageIndex && action.payload.toIndex >= state.activePageIndex) ||
        (action.payload.fromIndex > state.activePageIndex && action.payload.toIndex <= state.activePageIndex)
      ) {
        newActiveIndex = action.payload.fromIndex < action.payload.toIndex
          ? state.activePageIndex - 1
          : state.activePageIndex + 1;
      }
      return {
        ...state,
        proposals: newProposals,
        activePageIndex: newActiveIndex,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UPDATE_PAGE_FIELD': {
      const newProposals = state.proposals.map((p) => {
        if (p.id !== action.payload.proposalId) return p;
        const newPages = [...p.pages];
        const page = { ...newPages[action.payload.pageIndex] };
        (page as any)[action.payload.field] = action.payload.value;
        newPages[action.payload.pageIndex] = page;
        return { ...p, pages: newPages, updatedAt: new Date().toISOString() };
      });
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return {
        ...state,
        proposals: newProposals,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        proposals: state.history[newIndex],
        activeProposalId: state.history[newIndex][0]?.id || state.activeProposalId,
        activePageIndex: 0,
        historyIndex: newIndex,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        proposals: state.history[newIndex],
        activeProposalId: state.history[newIndex][0]?.id || state.activeProposalId,
        activePageIndex: 0,
        historyIndex: newIndex,
      };
    }

    case 'IMPORT_PROPOSAL': {
      const newProposals = [action.payload, ...state.proposals];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newProposals);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return {
        ...state,
        proposals: newProposals,
        activeProposalId: action.payload.id,
        activePageIndex: 0,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SET_LAST_SAVED': {
      return {
        ...state,
        lastSavedAt: action.payload,
      };
    }

    case 'SET_SAVE_ERROR': {
      return {
        ...state,
        saveError: action.payload,
      };
    }

    default:
      return state;
  }
}

const initialState: ProposalState = {
  proposals: initialProposalsList,
  activeProposalId: initialProposalsList[0]?.id || socialDrishtiProposal.id,
  activePageIndex: 0,
  history: [initialProposalsList],
  historyIndex: 0,
  lastSavedAt: null,
  saveError: null,
};

interface ProposalContextValue {
  state: ProposalState;
  dispatch: React.Dispatch<ProposalAction>;
  activeProposal: Proposal;
  createProposal: (proposal: Proposal) => void;
  updateProposal: (proposal: Proposal) => void;
  deleteProposal: (id: string) => void;
  selectProposal: (id: string) => void;
  setActivePageIndex: (index: number) => void;
  addPage: (proposalId: string, page: ProposalPage) => void;
  deletePage: (proposalId: string, pageIndex: number) => void;
  reorderPage: (proposalId: string, fromIndex: number, toIndex: number) => void;
  updatePageField: (proposalId: string, pageIndex: number, field: keyof ProposalPage, value: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  importProposal: (proposal: Proposal) => void;
  saveNow: () => void;
  clearSaveError: () => void;
}

const ProposalContext = createContext<ProposalContextValue | null>(null);

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(proposalReducer, initialState, (saved) => {
    try {
      const stored = localStorage.getItem('proposa_proposals_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((p: any) => isLegacyProposal(p) ? migrateProposal(p) : p);
          return {
            ...initialState,
            proposals: migrated,
            activeProposalId: migrated[0]?.id || initialState.activeProposalId,
            history: [migrated],
            historyIndex: 0,
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse saved proposals', e);
    }
    return initialState;
  });

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef(false);

  // Debounced autosave to localStorage
  useEffect(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    pendingSaveRef.current = true;

    autosaveTimeoutRef.current = setTimeout(() => {
      if (!pendingSaveRef.current) return;
      pendingSaveRef.current = false;

      try {
        localStorage.setItem('proposa_proposals_v1', JSON.stringify(state.proposals));
        dispatch({ type: 'SET_LAST_SAVED', payload: Date.now() });
        dispatch({ type: 'SET_SAVE_ERROR', payload: null });
      } catch (e: any) {
        console.error('Failed to save proposals to localStorage', e);
        // Check for quota exceeded error
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.message?.includes('quota')) {
          dispatch({ type: 'SET_SAVE_ERROR', payload: 'Storage quota exceeded. Some changes may not be saved.' });
        } else {
          dispatch({ type: 'SET_SAVE_ERROR', payload: 'Failed to save changes. Please try again.' });
        }
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [state.proposals]);

  // Handle URL hash for shared proposals
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('#proposal=') || hash.includes('#share='))) {
      try {
        const encodedData = hash.replace('#proposal=', '').replace('#share=', '');
        const jsonString = decodeURIComponent(encodedData);
        const parsed: any = JSON.parse(jsonString);

        if (parsed && parsed.title && parsed.pages) {
          const migrated = isLegacyProposal(parsed) ? migrateProposal(parsed) : parsed;
          const sharedProposal: Proposal = {
            ...migrated,
            id: `shared-${Date.now()}`,
            title: migrated.title + ' (Shared)',
            updatedAt: new Date().toISOString(),
          };

          dispatch({ type: 'IMPORT_PROPOSAL', payload: sharedProposal });
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {
        console.error('Failed to parse shared proposal URL hash', e);
      }
    }
  }, []);

  const activeProposal = state.proposals.find((p) => p.id === state.activeProposalId) || state.proposals[0] || socialDrishtiProposal;

  const createProposal = (proposal: Proposal) => dispatch({ type: 'CREATE_PROPOSAL', payload: proposal });
  const updateProposal = (proposal: Proposal) => dispatch({ type: 'UPDATE_PROPOSAL', payload: proposal });
  const deleteProposal = (id: string) => dispatch({ type: 'DELETE_PROPOSAL', payload: id });
  const selectProposal = (id: string) => dispatch({ type: 'SELECT_PROPOSAL', payload: id });
  const setActivePageIndex = (index: number) => dispatch({ type: 'SET_ACTIVE_PAGE_INDEX', payload: index });
  const addPage = (proposalId: string, page: ProposalPage) => dispatch({ type: 'ADD_PAGE', payload: { proposalId, page } });
  const deletePage = (proposalId: string, pageIndex: number) => dispatch({ type: 'DELETE_PAGE', payload: { proposalId, pageIndex } });
  const reorderPage = (proposalId: string, fromIndex: number, toIndex: number) => dispatch({ type: 'REORDER_PAGE', payload: { proposalId, fromIndex, toIndex } });
  const updatePageField = (proposalId: string, pageIndex: number, field: keyof ProposalPage, value: any) => dispatch({ type: 'UPDATE_PAGE_FIELD', payload: { proposalId, pageIndex, field, value } });
  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });
  const importProposal = (proposal: Proposal) => dispatch({ type: 'IMPORT_PROPOSAL', payload: proposal });

  const saveNow = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    pendingSaveRef.current = false;
    try {
      localStorage.setItem('proposa_proposals_v1', JSON.stringify(state.proposals));
      dispatch({ type: 'SET_LAST_SAVED', payload: Date.now() });
      dispatch({ type: 'SET_SAVE_ERROR', payload: null });
    } catch (e: any) {
      console.error('Failed to save proposals to localStorage', e);
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.message?.includes('quota')) {
        dispatch({ type: 'SET_SAVE_ERROR', payload: 'Storage quota exceeded. Some changes may not be saved.' });
      } else {
        dispatch({ type: 'SET_SAVE_ERROR', payload: 'Failed to save changes. Please try again.' });
      }
    }
  }, [state.proposals]);

  const clearSaveError = useCallback(() => {
    dispatch({ type: 'SET_SAVE_ERROR', payload: null });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <ProposalContext.Provider value={{
      state,
      dispatch,
      activeProposal,
      createProposal,
      updateProposal,
      deleteProposal,
      selectProposal,
      setActivePageIndex,
      addPage,
      deletePage,
      reorderPage,
      updatePageField,
      undo,
      redo,
      canUndo,
      canRedo,
      importProposal,
      saveNow,
      clearSaveError,
    }}>
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposalContext() {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error('useProposalContext must be used within a ProposalProvider');
  }
  return context;
}