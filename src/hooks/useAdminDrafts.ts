import { useState, useEffect, useCallback, useRef } from 'react';

export interface AdminPostState {
  postType: string;
  title: string;
  summary: string;
  slug: string;
  link: string;
  content: string;
}

export interface ManualDraft extends AdminPostState {
  id: string;
  timestamp: number;
}

const AUTOSAVE_KEY = 'luverse_admin_autosave';
const MANUAL_DRAFTS_KEY = 'luverse_admin_manual_drafts';

export function useAdminDrafts(
  currentState: AdminPostState, 
  onRestore: (state: AdminPostState) => void
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [drafts, setDrafts] = useState<ManualDraft[]>([]);
  const isInitialMount = useRef(true);

  // Load manual drafts
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MANUAL_DRAFTS_KEY);
      if (stored) {
        setDrafts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse drafts", e);
    }
  }, []);

  // Check for auto-save on mount and restore it
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTOSAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.title || parsed.content)) {
          onRestore(parsed);
          setLastSaved(new Date());
        }
      }
    } catch (e) {
      console.error("Failed to parse auto-save", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Auto-save logic (Debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      if (currentState.title || currentState.content) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(currentState));
        setLastSaved(new Date());
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [currentState]);

  const saveManualDraft = useCallback(() => {
    const newDraft: ManualDraft = {
      ...currentState,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    setDrafts((prev) => {
      const updated = [newDraft, ...prev].slice(0, 15); // Keep up to 15 drafts
      localStorage.setItem(MANUAL_DRAFTS_KEY, JSON.stringify(updated));
      return updated;
    });
    
    return newDraft;
  }, [currentState]);

  const restoreDraft = useCallback((draft: AdminPostState) => {
    onRestore(draft);
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
  }, [onRestore]);

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
  }, []);

  const deleteDraft = useCallback((draftId: string) => {
    setDrafts((prev) => {
      const updated = prev.filter(d => d.id !== draftId);
      localStorage.setItem(MANUAL_DRAFTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    lastSaved,
    drafts,
    saveManualDraft,
    restoreDraft,
    clearAutoSave,
    deleteDraft
  };
}
