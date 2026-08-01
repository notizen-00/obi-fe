import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import { clearAuth } from '$lib/auth';

import type { ActiveExam, Answer, Attempt, ExamKind, ExamSummary, User } from '$lib/types';

const apiBaseUrl = env.PUBLIC_CBT_API_BASE_URL || '';


export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown
  ) {
    super(message);
  }
}

async function request<T>(
  action: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError('URL API belum dikonfigurasi.', 0);
  }
  const [actionName, extraQuery] = action.split('&', 2);
  const url = apiBaseUrl + '?action=' + encodeURIComponent(actionName) + (extraQuery ? '&' + extraQuery : '');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  if (options.auth !== false && browser) {
    const token = sessionStorage.getItem('obi_access_token');
    if (token) headers.set('Authorization', 'Bearer ' + token);
  }
  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server.', 0);
  }
  let payload: any;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('Respons server tidak dapat dibaca.', response.status);
  }
  if (response.status === 401 && options.auth !== false) {
    clearAuth();
    if (browser) await goto('/login');
  }
  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.error || payload?.message || 'Permintaan gagal diproses.', response.status, payload);
  }
  return payload?.data ?? payload;
}

export const api = {
  async login(username: string, password: string): Promise<{ user: User; access_token: string; expires_at: string }> {
    return request('token_login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ username, password })
    });
  },
  async checkUsername(nik: string): Promise<{ username: string }> {
    return request('check_username', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ nik })
    });
  },
  async forgotPassword(data: {
    nik: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  }): Promise<unknown> {
    return request('forgot_password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data)
    });
  },
  async me(): Promise<{ user: User; attempts: Attempt[] }> {
    return request('me');
  },
  async exams(): Promise<ExamSummary[]> {
    return request('exams');
  },
  async start(examId: number, examKind: ExamKind) {
    return request('start', {
      method: 'POST',
      body: JSON.stringify({ exam_type_id: examId, exam_kind: examKind })
    });
  },
  async exam(exam: ExamSummary): Promise<ActiveExam> {
    const data = await request<any>('exam&exam_type_id=' + exam.id);
    const hasAnswerKey = JSON.stringify(data).includes('correct_option');
    if (hasAnswerKey) throw new ApiError('Respons soal tidak aman dan telah ditolak.', 500);
    return { ...data, exam };
  },
  async save(examId: number, answers: Record<string, Answer>) {
    return request('save', {
      method: 'POST',
      body: JSON.stringify({ exam_type_id: examId, answers })
    });
  },
  async submit(examId: number) {
    return request('submit', {
      method: 'POST',
      body: JSON.stringify({ exam_type_id: examId })
    });
  },
  async survey(examId: number, rating: number, kesan: string, saran: string) {
    return request('survey', {
      method: 'POST',
      body: JSON.stringify({ exam_type_id: examId, rating, kesan, saran })
    });
  },
  async logout() {
    await request('logout', { method: 'POST' });
  }
};
