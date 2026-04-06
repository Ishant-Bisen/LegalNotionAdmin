import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { Candidate, CandidateStatus } from '../types/Candidate';
import type { ApiCandidateDocument } from '../types/Candidate';
import { mapApiCandidateToCandidate } from '../types/Candidate';
import { deleteCandidate, fetchCandidatesList, patchCandidate, submitCandidate } from '../api/candidatesApi';

interface CareerContextType {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  refreshCandidates: (opts?: { silent?: boolean }) => Promise<void>;
  submitCandidate: (fd: FormData) => Promise<void>;
  setCandidateStatus: (id: string, status: CandidateStatus) => Promise<void>;
  removeCandidate: (id: string) => Promise<void>;
  setSelectionMailSent: (id: string, sent: boolean) => void;
}

const CareerContext = createContext<CareerContextType | null>(null);

const MAIL_SENT_KEY = 'legalnotion_candidate_selection_mail_sent';

function loadMailSentMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(MAIL_SENT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const obj = parsed as Record<string, unknown>;
    const out: Record<string, boolean> = {};
    Object.entries(obj).forEach(([k, v]) => {
      out[k] = Boolean(v);
    });
    return out;
  } catch {
    return {};
  }
}

function saveMailSentMap(map: Record<string, boolean>) {
  localStorage.setItem(MAIL_SENT_KEY, JSON.stringify(map));
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mailSentMap, setMailSentMap] = useState<Record<string, boolean>>(() => loadMailSentMap());

  const mailSentMapRef = useRef(mailSentMap);
  const listFetchGen = useRef(0);
  useEffect(() => {
    mailSentMapRef.current = mailSentMap;
    // Update checkbox values without refetching.
    setCandidates((prev) => prev.map((c) => ({ ...c, selectionMailSent: mailSentMap[c.id] ?? false })));
  }, [mailSentMap]);

  const refreshCandidates = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    const gen = ++listFetchGen.current;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const docs = await fetchCandidatesList();
      if (gen !== listFetchGen.current) return;
      const mapped: Candidate[] = (docs as ApiCandidateDocument[]).map((doc) => {
        const selectionMailSent = mailSentMapRef.current[doc._id] ?? false;
        return mapApiCandidateToCandidate(doc, selectionMailSent);
      });
      setCandidates(mapped);
      setError(null);
    } catch (e) {
      if (gen !== listFetchGen.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load candidates');
      setCandidates([]);
    } finally {
      if (gen === listFetchGen.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCandidates();
  }, [refreshCandidates]);

  const submitCandidateFn = useCallback(
    async (fd: FormData) => {
      await submitCandidate(fd);
      await refreshCandidates({ silent: true });
    },
    [refreshCandidates],
  );

  const setCandidateStatus = useCallback(
    async (id: string, status: CandidateStatus) => {
      await patchCandidate(id, { status });
      if (status !== 'accepted') {
        setMailSentMap((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
      await refreshCandidates({ silent: true });
    },
    [refreshCandidates],
  );

  const setSelectionMailSent = useCallback((id: string, sent: boolean) => {
    setMailSentMap((prev) => {
      const next = { ...prev };
      if (sent) next[id] = true;
      else delete next[id];
      return next;
    });
  }, []);

  const removeCandidate = useCallback(
    async (id: string) => {
      await deleteCandidate(id);
      setMailSentMap((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refreshCandidates({ silent: true });
    },
    [refreshCandidates],
  );

  useEffect(() => {
    saveMailSentMap(mailSentMap);
  }, [mailSentMap]);

  const value: CareerContextType = useMemo(
    () => ({
      candidates,
      loading,
      error,
      refreshCandidates,
      submitCandidate: submitCandidateFn,
      setCandidateStatus,
      removeCandidate,
      setSelectionMailSent,
    }),
    [candidates, loading, error, refreshCandidates, submitCandidateFn, setCandidateStatus, removeCandidate, setSelectionMailSent],
  );

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareers() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error('useCareers must be used within CareerProvider');
  return ctx;
}
