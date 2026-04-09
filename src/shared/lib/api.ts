import type { ErrorResponse } from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nquoc.vn/api/v1';

export class ApiError extends Error {
  code: string;
  request_id: string;
  field_errors?: Array<{ field: string; code: string; message: string }>;

  constructor(err: ErrorResponse) {
    super(err.message);
    this.name = 'ApiError';
    this.code = err.code;
    this.request_id = err.request_id;
    this.field_errors = err.field_errors;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  // Try to get JWT from Supabase session
  let token: string | null = null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token ?? null;
    }
  } catch {
    // Auth not available, proceed without token
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody: ErrorResponse = await res.json().catch(() => ({
      code: 'UNKNOWN_ERROR',
      message: `HTTP ${res.status}: ${res.statusText}`,
      request_id: 'unknown',
    }));
    throw new ApiError(errorBody);
  }

  return res.json() as Promise<T>;
}
