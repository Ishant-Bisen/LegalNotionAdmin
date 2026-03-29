import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Candidate, CandidateStatus } from '../types/Candidate';

interface CareerContextType {
  candidates: Candidate[];
  addCandidate: (data: Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt' | 'selectionMailSent'> & { selectionMailSent?: boolean }) => Candidate;
  updateCandidate: (id: string, data: Partial<Omit<Candidate, 'id' | 'appliedAt'>>) => void;
  setCandidateStatus: (id: string, status: CandidateStatus) => void;
  setSelectionMailSent: (id: string, sent: boolean) => void;
  removeCandidate: (id: string) => void;
}

const CareerContext = createContext<CareerContextType | null>(null);

const STORAGE_KEY = 'legalnotion_candidates';

const now = () => new Date().toISOString();

function sampleCandidates(): Candidate[] {
  const t = now();
  return [
    {
      id: uuidv4(),
      name: 'Aisha Khan',
      email: 'aisha.example@university.edu',
      college: 'National Law School',
      passoutYear: 2025,
      currentLocation: 'Bangalore',
      resumeFileName: null,
      resumeDataUrl: null,
      status: 'pending',
      appliedAt: t,
      updatedAt: t,
      selectionMailSent: false,
    },
    {
      id: uuidv4(),
      name: 'Rahul Verma',
      email: 'rahul.verma@email.com',
      college: 'Delhi University',
      passoutYear: 2024,
      currentLocation: 'Mumbai',
      resumeFileName: null,
      resumeDataUrl: null,
      status: 'waiting',
      appliedAt: t,
      updatedAt: t,
      selectionMailSent: false,
    },
  ];
}

function loadCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleCandidates();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return sampleCandidates();
    return parsed.map(normalizeCandidate);
  } catch {
    return sampleCandidates();
  }
}

function normalizeCandidate(x: Record<string, unknown>): Candidate {
  const statusRaw = x.status;
  const status: CandidateStatus =
    statusRaw === 'accepted' || statusRaw === 'rejected' || statusRaw === 'waiting' || statusRaw === 'pending'
      ? statusRaw
      : 'pending';

  return {
    id: typeof x.id === 'string' ? x.id : uuidv4(),
    name: typeof x.name === 'string' ? x.name : 'Unknown',
    email: typeof x.email === 'string' ? x.email : '',
    college: typeof x.college === 'string' ? x.college : '',
    passoutYear: typeof x.passoutYear === 'number' ? x.passoutYear : new Date().getFullYear(),
    currentLocation: typeof x.currentLocation === 'string' ? x.currentLocation : '',
    resumeFileName: typeof x.resumeFileName === 'string' ? x.resumeFileName : null,
    resumeDataUrl: typeof x.resumeDataUrl === 'string' ? x.resumeDataUrl : null,
    status,
    appliedAt: typeof x.appliedAt === 'string' ? x.appliedAt : now(),
    updatedAt: typeof x.updatedAt === 'string' ? x.updatedAt : now(),
    selectionMailSent: Boolean(x.selectionMailSent),
  };
}

function saveCandidates(list: Candidate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(() => loadCandidates());

  useEffect(() => {
    saveCandidates(candidates);
  }, [candidates]);

  const addCandidate = useCallback(
    (
      data: Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt' | 'selectionMailSent'> & { selectionMailSent?: boolean },
    ): Candidate => {
      const ts = now();
      const row: Candidate = {
        ...data,
        selectionMailSent: data.selectionMailSent ?? false,
        id: uuidv4(),
        appliedAt: ts,
        updatedAt: ts,
      };
      setCandidates((prev) => [row, ...prev]);
      return row;
    },
    [],
  );

  const updateCandidate = useCallback((id: string, data: Partial<Omit<Candidate, 'id' | 'appliedAt'>>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: now() } : c)),
    );
  }, []);

  const setCandidateStatus = useCallback((id: string, status: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, status, updatedAt: now() };
        if (status !== 'accepted') next.selectionMailSent = false;
        return next;
      }),
    );
  }, []);

  const setSelectionMailSent = useCallback((id: string, sent: boolean) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selectionMailSent: sent, updatedAt: now() } : c)),
    );
  }, []);

  const removeCandidate = useCallback((id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value: CareerContextType = {
    candidates,
    addCandidate,
    updateCandidate,
    setCandidateStatus,
    setSelectionMailSent,
    removeCandidate,
  };

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareers() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error('useCareers must be used within CareerProvider');
  return ctx;
}
