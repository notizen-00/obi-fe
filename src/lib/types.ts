export type ExamKind = 'main' | 'tryout';
export type AttemptStatus = 'not_started' | 'in_progress' | 'submitted' | 'expired';
export type Answer = 'A' | 'B' | 'C' | 'D' | 'E';
export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'offline' | 'error';

export interface User {
  id: string;
  nama: string;
  username: string;
  email: string;
  nik: string;
  participant_id: string;
  sekolah: string;
  foto_profil: string | null;
}

export interface ExamSummary {
  id: number;
  name: string;
  kind: ExamKind;
  description: string | null;
  duration_minutes: number;
  question_count: number;
  is_default: boolean;
  ready_questions: number;
  is_ready: boolean;
}

export interface Attempt {
  exam_type_id: number;
  status: AttemptStatus;
  start_at?: string;
  submitted_at?: string;
}

export interface ExamQuestion {
  question_no: number | string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
}

export interface ActiveExam {
  exam: ExamSummary;
  questions: ExamQuestion[];
  answers: Record<string, Answer>;
  server_time: string;
  start_at?: string;
  ends_at: string;
  status: AttemptStatus;
}
