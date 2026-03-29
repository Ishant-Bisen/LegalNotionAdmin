export type CandidateStatus = 'pending' | 'accepted' | 'rejected' | 'waiting';

export type Candidate = {
  id: string;
  name: string;
  email: string;
  college: string;
  passoutYear: number;
  currentLocation: string;
  /** Original filename when uploaded */
  resumeFileName: string | null;
  /** PDF as data URL (local demo only; keep files small) */
  resumeDataUrl: string | null;
  status: CandidateStatus;
  appliedAt: string;
  updatedAt: string;
  /** After acceptance: has the selection email been sent? */
  selectionMailSent: boolean;
};
